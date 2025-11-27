import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { InsightsQueryDto } from '../dto/insights-query.dto';
import { DateFilter } from '../../events/dto/get-events.dto';
import { JourneyResponse } from '../interfaces/categorized-insights.interface';

@Injectable()
export class JourneyService {
  private readonly logger = new Logger(JourneyService.name);

  constructor(private readonly prisma: PrismaService) {}

  private getDateRange(
    dateFilter?: DateFilter,
    startDate?: string,
    endDate?: string,
  ) {
    const now = new Date();

    if (dateFilter === DateFilter.CUSTOM && startDate && endDate) {
      const startStr = startDate.includes('T')
        ? startDate
        : `${startDate}T00:00:00`;
      const endStr = endDate.includes('T')
        ? endDate
        : `${endDate}T23:59:59.999`;
      return {
        start: new Date(startStr),
        end: new Date(endStr),
      };
    }

    if (dateFilter === DateFilter.DAY) {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      const end = new Date(now);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    }

    if (dateFilter === DateFilter.WEEK) {
      const start = new Date(now);
      start.setDate(now.getDate() - now.getDay());
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    }

    if (dateFilter === DateFilter.MONTH) {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59,
        999,
      );
      return { start, end };
    }

    if (dateFilter === DateFilter.YEAR) {
      const start = new Date(now.getFullYear(), 0, 1);
      const end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
      return { start, end };
    }

    const start = new Date(now);
    start.setDate(now.getDate() - 30);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  async getJourneyStats(
    siteKey: string,
    queryDto: InsightsQueryDto,
  ): Promise<JourneyResponse> {
    const site = await this.prisma.site.findUnique({
      where: { siteKey },
      select: { id: true },
    });
    if (!site) throw new NotFoundException('Site não encontrado');

    const dateRange = this.getDateRange(
      queryDto.dateFilter,
      queryDto.startDate,
      queryDto.endDate,
    );

    // 1. Avg Time on Site (Session Duration)
    // Calculated as MAX(ts) - MIN(ts) per session
    const sessionDurations = await this.prisma.$queryRaw<
      Array<{ duration_seconds: number }>
    >`
      WITH session_times AS (
        SELECT
          "sessionId",
          EXTRACT(EPOCH FROM (MAX(ts) - MIN(ts))) as duration
        FROM "Event"
        WHERE "siteKey" = ${siteKey}
          AND ts >= ${dateRange.start}
          AND ts <= ${dateRange.end}
          AND "sessionId" IS NOT NULL
        GROUP BY "sessionId"
        HAVING COUNT(*) > 1 -- Need at least 2 events to calculate duration
      )
      SELECT AVG(duration) as duration_seconds
      FROM session_times
    `;
    const avgTimeOnSite = Math.round(
      Number(sessionDurations[0]?.duration_seconds || 0),
    );

    // 2. Avg Page Depth
    // Calculated as MAX(journey_length) per session or Count(property_page_view)
    // Assuming 'journey_length' property exists in events or we count page views
    const pageDepths = await this.prisma.$queryRaw<
      Array<{ avg_depth: number }>
    >`
      WITH session_depths AS (
        SELECT
          "sessionId",
          COUNT(*) as depth
        FROM "Event"
        WHERE "siteKey" = ${siteKey}
          AND ts >= ${dateRange.start}
          AND ts <= ${dateRange.end}
          AND name IN ('property_page_view', 'search_submit', 'home_view', 'results_view') -- Page view events
          AND "sessionId" IS NOT NULL
        GROUP BY "sessionId"
      )
      SELECT AVG(depth) as avg_depth
      FROM session_depths
    `;
    const avgPageDepth =
      Math.round(Number(pageDepths[0]?.avg_depth || 0) * 10) / 10;

    // 3. Recurrent Visitors
    // Percentage of sessions where userId has appeared in previous periods (or just check if user has > 1 session in period if we can't check history easily without performance cost)
    // A better approach for "recurrent" in this context might be: Users with > 1 session in the period OR Users who visited before.
    // For simplicity and performance, let's check users with > 1 session in the selected period for now, or check if userId exists in events before start date.
    // Let's try: Count distinct users who have events BEFORE start date AND events DURING period.

    // Efficient query for recurrence:
    // Count distinct userIds in period who ALSO have events before period.
    // Note: This requires userId to be consistent. If mostly anonymous, this metric might be low.
    const recurrentStats = await this.prisma.$queryRaw<
      Array<{ total_visitors: bigint; recurrent_visitors: bigint }>
    >`
      WITH period_visitors AS (
        SELECT DISTINCT "userId"
        FROM "Event"
        WHERE "siteKey" = ${siteKey}
          AND ts >= ${dateRange.start}
          AND ts <= ${dateRange.end}
          AND "userId" IS NOT NULL
      ),
      recurrent_visitors AS (
        SELECT COUNT(DISTINCT pv."userId") as count
        FROM period_visitors pv
        WHERE EXISTS (
          SELECT 1
          FROM "Event" e
          WHERE e."siteKey" = ${siteKey}
            AND e."userId" = pv."userId"
            AND e.ts < ${dateRange.start}
        )
      )
      SELECT
        (SELECT COUNT(*) FROM period_visitors) as total_visitors,
        (SELECT count FROM recurrent_visitors) as recurrent_visitors
    `;

    const totalVisitors = Number(recurrentStats[0]?.total_visitors || 0);
    const recurrentVisitors = Number(
      recurrentStats[0]?.recurrent_visitors || 0,
    );
    const recurrentVisitorsPercentage =
      totalVisitors > 0
        ? Math.round((recurrentVisitors / totalVisitors) * 100 * 100) / 100
        : 0;

    return {
      avgTimeOnSite,
      avgPageDepth,
      recurrentVisitorsPercentage,
      period: {
        start: dateRange.start.toISOString(),
        end: dateRange.end.toISOString(),
      },
    };
  }
}
