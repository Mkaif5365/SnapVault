import { useRef, useState } from "react";
import Webcam from "react-webcam";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import type { Photo } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Camera, ImageOff } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { applyFilter } from "@/lib/filters";

interface Props {
  eventId: number;
  photoLimit: number;
}

export default function CameraView({ eventId, photoLimit }: Props) {
  const webcamRef = useRef<Webcam>(null);
  const [filter, setFilter] = useState("original");
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const queryClient = useQueryClient();

  const { data: photos } = useQuery<Photo[]>({
    queryKey: [`/api/events/${eventId}/photos`]
  });

  const { mutate, isPending, error } = useMutation({
    mutationFn: async (imageData: string) => {
      const currentPhotos = photos || [];
      if (currentPhotos.length >= photoLimit) {
        throw new Error(`Photo limit of ${photoLimit} exceeded`);
      }
      const data = { eventId, imageUrl: imageData, filter };
      const res = await apiRequest("POST", "/api/photos", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}/photos`] });
    }
  });

  if (photos && photos.length >= photoLimit) {
    return (
      <div className="space-y-4">
        <div className="p-4 text-center bg-red-100 text-red-600 rounded-lg">
          Photo limit exceeded. You cannot take more photos.
        </div>
      </div>
    );
  }

  const capture = async () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      const filteredImage = await applyFilter(imageSrc, filter);
      mutate(filteredImage);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative aspect-[3/4] bg-black rounded-lg overflow-hidden">
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          className="absolute inset-0 w-full h-full object-cover"
          videoConstraints={{
            facingMode: facingMode
          }}
          style={{
            filter: filter === 'sepia' ? 'sepia(100%)' : 
                    filter === 'grainy' ? 'contrast(150%) brightness(90%)' :
                    filter === 'blackAndWhite' ? 'grayscale(100%)' :
                    filter === 'vintage' ? 'sepia(50%) contrast(85%) brightness(90%) saturate(85%)' :
                    filter === 'blur' ? 'blur(2px)' :
                    filter === 'cool' ? 'hue-rotate(180deg)' :
                    filter === 'warm' ? 'sepia(30%) saturate(140%)' :
                    'none'
          }}
        />
        <Button
          variant="secondary"
          size="sm"
          className="absolute top-2 right-2 bg-black/50 hover:bg-black/70"
          onClick={() => setFacingMode(prev => prev === "user" ? "environment" : "user")}
        >
          Switch Camera
        </Button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 px-2 md:px-0 snap-x">
        {["original", "sepia", "grainy", "blackAndWhite", "vintage", "blur", "cool", "warm"].map((f) => (
          <Button
            key={f}
            variant={filter === f ? "default" : "outline"}
            onClick={() => setFilter(f)}
          >
            {f}
          </Button>
        ))}
      </div>

      <Button 
        className="w-full" 
        onClick={capture}
        disabled={isPending}
      >
        <Camera className="mr-2 h-4 w-4" />
        Take Photo
      </Button>
    </div>
  );
}
