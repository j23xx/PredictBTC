
import TradingChart from '@/components/TradingChart';
import IndicatorPanel from '@/components/IndicatorPanel';
import ClientWrapper from '@/components/ClientWrapper';

export default function Home() {
  return (
    <ClientWrapper>
      <div className="flex flex-col lg:flex-row">
        <div className="flex-1 p-4">
          <div className="h-[70vh] min-h-[400px]">
            <TradingChart />
          </div>
        </div>
        
        <div className="lg:w-80 p-4 border-t lg:border-t-0 lg:border-l border-gray-200">
          <IndicatorPanel />
        </div>
      </div>
    </ClientWrapper>
  );
}