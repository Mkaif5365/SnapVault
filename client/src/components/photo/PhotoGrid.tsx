import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import type { Photo } from "@shared/schema";
import { Download, ArrowLeft, X, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useLocation } from "react-router-dom"; // Removed useNavigate


interface Props {
  photos: Photo[];
  eventTitle?: string;
  onBack?: () => void;
  revealDelay: number;
}

export default function PhotoGrid({ photos, onBack, revealDelay }: Props) {
  const [open, setOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [revealedPhotos, setRevealedPhotos] = useState<string[]>([]); // Track revealed photos

  const handleDownload = async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `photo-${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const [timeLeft, setTimeLeft] = useState<{[key: string]: string}>({});

  const isPhotoRevealed = (photo: Photo) => {
    const revealTime = new Date(photo.takenAt!).getTime() + (revealDelay * 60 * 1000);
    return new Date().getTime() >= revealTime;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const newTimeLeft: {[key: string]: string} = {};
      
      photos.forEach(photo => {
        if (!isPhotoRevealed(photo)) {
          const revealTime = new Date(photo.takenAt!).getTime() + (revealDelay * 60 * 1000);
          const diff = revealTime - now;
          
          const minutes = Math.floor(diff / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          
          newTimeLeft[photo.id] = `${minutes}m ${seconds}s`;
        }
      });
      
      setTimeLeft(newTimeLeft);
    }, 1000);

    return () => clearInterval(interval);
  }, [photos, revealDelay]);

  if (!photos || photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] gap-4">
        <p className="text-gray-500">No photos yet</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      {onBack && <Button onClick={onBack} className="mb-4">Back to Home</Button>} {/* Conditional back button */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {photos.map((photo) => (
          <Card key={photo.id} className="overflow-hidden">
            <CardContent className="p-0">
              <AlertDialog open={open} onOpenChange={setOpen}>
                <AlertDialogTrigger asChild>
                  <button
                    className="w-full aspect-square relative group"
                    onClick={() => {
                      setSelectedImage(photo.imageUrl);
                      setSelectedPhoto(photo);
                    }}
                  >
                    {isPhotoRevealed(photo) ? (
                      <div className="relative w-full h-full">
                        <img
                          src={photo.imageUrl}
                          alt="Photo"
                          className="w-full h-full object-cover"
                        />
                        {photo.userName && (
                          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-2 text-sm">
                            <div className="flex items-center">
                              <UserCircle className="w-4 h-4 mr-1" />
                              <span>{photo.userName}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center flex-col">
                        <p className="text-sm text-gray-500">Photo will be revealed in</p>
                        <p className="text-sm font-bold text-gray-700">{timeLeft[photo.id] || 'Calculating...'}</p>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Download className="w-6 h-6 text-white" />
                    </div>
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent className="max-w-3xl">
                  <div className="relative">
                    {selectedImage && (
                      <img src={selectedImage} alt="Preview" className="w-full h-[500px] object-contain" />
                    )}
                    <div className="absolute top-4 right-4 flex gap-2">
                      <Button
                        variant="secondary"
                        onClick={() => handleDownload(selectedImage!)}
                        className="bg-white/80 hover:bg-white/90"
                      >
                        <Download className="h-5 w-5" />
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => setOpen(false)}
                        className="bg-white/80 hover:bg-white/90"
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                    {selectedPhoto?.userName && (
                      <div className="absolute bottom-4 left-4 right-4 bg-black/60 text-white p-2 rounded">
                        <div className="flex items-center">
                          <UserCircle className="w-5 h-5 mr-2" />
                          <span>Photo by: {selectedPhoto.userName}</span>
                        </div>
                        <div className="text-xs text-gray-300 mt-1">
                          Taken at: {new Date(selectedPhoto.takenAt!).toLocaleString()}
                        </div>
                      </div>
                    )}
                  </div>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}