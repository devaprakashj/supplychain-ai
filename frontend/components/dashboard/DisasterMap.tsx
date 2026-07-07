"use client";
import dynamic from "next/dynamic";
import NoDataCard from "@/components/ui/NoDataCard";

const Map = dynamic(() => import("./DisasterMapClient"), {
  ssr: false,
  loading: () => <div className="skeleton rounded-xl h-72 w-full" />,
});

interface DisasterMapProps {
  data: any;
  loading: boolean;
  error: string | null;
}

export default function DisasterMap({ data, loading, error }: DisasterMapProps) {
  if (loading) return <div className="skeleton rounded-xl h-72 w-full" />;
  if (error) return <NoDataCard reason={error} height="h-72" />;
  if (!data) return <NoDataCard reason="No live disaster data available" height="h-72" />;
  return <Map data={data} />;
}
