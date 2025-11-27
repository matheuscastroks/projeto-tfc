import { Module } from '@nestjs/common';
import { OverviewModule } from './overview/overview.module';
import { SearchModule } from './search/search.module';
import { PropertyModule } from './property/property.module';
import { ConversionModule } from './conversion/conversion.module';
import { JourneyModule } from './journey/journey.module';

@Module({
  imports: [
    OverviewModule,
    SearchModule,
    PropertyModule,
    ConversionModule,
    JourneyModule,
  ],
})
export class InsightsModule {}
