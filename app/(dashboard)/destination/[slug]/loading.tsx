import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function DestinationLoading() {
  return (
    <div className="space-y-8 pb-10">
      <Skeleton className="h-6 w-40" />

      <Card className="overflow-hidden border-[#E8E8E2] bg-white p-0">
        <Skeleton className="h-[320px] w-full sm:h-[380px]" />
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <Card key={item} className="border-[#E8E8E2] bg-white">
            <CardHeader>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-9 w-20" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {[1, 2, 3, 4, 5].map((item) => (
          <Card key={item} className="border-[#E8E8E2] bg-white">
            <CardHeader>
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-12" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
