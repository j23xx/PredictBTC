import type { Indicator } from './types';

class IndicatorRegistry {
  private indicators = new Map<string, Indicator<unknown>>();

  register<TConfig>(indicator: Indicator<TConfig>): void {
    this.indicators.set(indicator.id, indicator as Indicator<unknown>);
  }

  get(id: string): Indicator<unknown> | undefined {
    return this.indicators.get(id);
  }

  getAll(): Indicator<unknown>[] {
    return Array.from(this.indicators.values());
  }

  remove(id: string): boolean {
    return this.indicators.delete(id);
  }

  clear(): void {
    this.indicators.clear();
  }
}

export const indicatorRegistry = new IndicatorRegistry();