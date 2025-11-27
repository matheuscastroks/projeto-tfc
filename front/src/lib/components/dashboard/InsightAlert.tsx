import { Alert, AlertDescription, AlertTitle } from '@ui/alert';
import { Lightbulb, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';

export type InsightType = 'opportunity' | 'warning' | 'positive' | 'negative';

interface InsightAlertProps {
  type: InsightType;
  title: string;
  description: string;
}

export function InsightAlert({ type, title, description }: InsightAlertProps) {
  const getIcon = () => {
    switch (type) {
      case 'opportunity':
        return <Lightbulb className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'positive':
        return <TrendingUp className="h-4 w-4" />;
      case 'negative':
        return <TrendingDown className="h-4 w-4" />;
      default:
        return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getVariant = () => {
    switch (type) {
      case 'warning':
      case 'negative':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const getClassName = () => {
    switch (type) {
      case 'opportunity':
        return 'border-yellow-500/50 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400';
      case 'positive':
        return 'border-green-500/50 bg-green-500/10 text-green-600 dark:text-green-400';
      default:
        return '';
    }
  };

  return (
    <Alert variant={getVariant()} className={getClassName()}>
      {getIcon()}
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
    </Alert>
  );
}
