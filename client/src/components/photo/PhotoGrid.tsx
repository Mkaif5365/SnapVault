import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import type { Photo } from "@shared/schema";

interface Props {
  photos: Photo[];
  revealDelay: number;
}

export default function PhotoGrid({ photos, revealDelay }: Props) {
  const [revealedPhotos, setRevealedPhotos] = useState<Photo[]>([]);

  useEffect(() => {
    const now = new Date();
    const revealed = photos.filter(photo => {
      if (!photo.takenAt) return false;
      const takenAt = new Date(photo.takenAt);
      const hoursSince = (now.getTime() - takenAt.getTime()) / (1000 * 60 * 60);
      return hoursSince >= revealDelay;
    });
    setRevealedPhotos(revealed);
  }, [photos, revealDelay]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {photos.map((photo) => {
        const isRevealed = revealedPhotos.find(p => p.id === photo.id);

        return (
          <Card key={photo.id} className="overflow-hidden">
            <CardContent className="p-0">
              {isRevealed ? (
                <img 
                  src={photo.imageUrl} 
                  alt="Event photo" 
                  className="w-full h-full object-cover aspect-square"
                />
              ) : (
                <div className="w-full h-full aspect-square bg-muted flex items-center justify-center">
                  <p className="text-sm text-center p-4">
                    Photo will be revealed in {revealDelay}h
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}