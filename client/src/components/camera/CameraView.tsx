import { useRef, useState } from "react";
import Webcam from "react-webcam";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: async (imageData: string) => {
      const data = { eventId, imageUrl: imageData, filter };
      const res = await apiRequest("POST", "/api/photos", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}/photos`] });
    }
  });

  const capture = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      const filteredImage = applyFilter(imageSrc, filter);
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
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {["original", "sepia", "grainy", "blackAndWhite"].map((f) => (
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
