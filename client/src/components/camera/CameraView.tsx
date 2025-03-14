import { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import type { Photo } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Camera, ImageOff, UserCircle, RefreshCw, Upload, Crown } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { applyFilter } from "@/lib/filters";
import { useLocation } from "wouter";

interface Props {
  eventId: number;
  photoLimit: number;
  isHost?: boolean;
}

interface UserInfo {
  userId: string;
  userName: string;
  eventId: number;
  isHost?: boolean;
}

// Helper function to compress images
const compressImage = async (base64Image: string, quality = 0.7, maxWidth = 1280): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = base64Image;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      
      // Calculate new dimensions if image is too large
      if (width > maxWidth) {
        height = Math.floor(height * (maxWidth / width));
        width = maxWidth;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to compressed JPEG
      const compressedImage = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedImage);
    };
    img.onerror = (error) => reject(error);
  });
};

export default function CameraView({ eventId, photoLimit, isHost }: Props) {
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [filter, setFilter] = useState("original");
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraPermission, setCameraPermission] = useState<"prompt" | "granted" | "denied" | "checking">("checking");
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [showWebcam, setShowWebcam] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  // Check if this is a mobile device
  useEffect(() => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    setIsMobileDevice(isMobile);
  }, []);

  // Always request camera permission on component mount
  useEffect(() => {
    // Force permission prompt on first load
    requestCameraPermission();
  }, []);

  // Check camera permissions
  useEffect(() => {
    async function checkCameraPermission() {
      try {
        // Check if the browser supports permissions API
        if (navigator.permissions && navigator.permissions.query) {
          const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
          setCameraPermission(result.state as "prompt" | "granted" | "denied");
          
          // Listen for permission changes
          result.addEventListener('change', () => {
            setCameraPermission(result.state as "prompt" | "granted" | "denied");
          });
        } else {
          // Fallback for browsers that don't support permissions API
          setCameraPermission("prompt");
        }
      } catch (error) {
        console.error("Error checking camera permission:", error);
        setCameraPermission("prompt");
      }
    }
    
    checkCameraPermission();
  }, []);

  // Request camera permission explicitly
  const requestCameraPermission = async () => {
    try {
      setCameraError(null);
      setShowWebcam(false);
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      // Only stop the stream if we're just checking permissions
      // Otherwise keep it for the webcam component
      if (!showWebcam) {
        stream.getTracks().forEach(track => track.stop());
      }
      
      setCameraPermission("granted");
      setShowWebcam(true);
    } catch (error) {
      console.error("Error requesting camera permission:", error);
      setCameraPermission("denied");
      setCameraError("Camera access denied. Please check your browser settings and try again.");
    }
  };

  useEffect(() => {
    // Check if user is registered for this event
    const storedUserInfo = localStorage.getItem(`event_${eventId}_user`);
    if (storedUserInfo) {
      try {
        const parsedUserInfo = JSON.parse(storedUserInfo);
        setUserInfo(parsedUserInfo);
      } catch (error) {
        console.error("Failed to parse user info:", error);
      }
    }
  }, [eventId]);

  // Get user's photos for this event
  const { data: allPhotos } = useQuery<Photo[]>({
    queryKey: [`/api/events/${eventId}/photos`]
  });

  // Filter photos by the current user
  const userPhotos = allPhotos?.filter(photo => photo.userId === userInfo?.userId) || [];

  const { mutate, isPending, error } = useMutation({
    mutationFn: async (imageData: string) => {
      setIsUploading(true);
      try {
        // Check if user has reached their photo limit
        if (userPhotos.length >= photoLimit) {
          throw new Error(`You've reached your limit of ${photoLimit} photos for this event`);
        }
        
        // Compress the image before uploading
        const compressedImage = await compressImage(imageData, 0.7);
        
        // Include user information with the photo
        const data = { 
          eventId, 
          imageUrl: compressedImage, 
          filter,
          userId: userInfo?.userId || (isHost ? "host" : undefined),
          userName: userInfo?.userName || (isHost ? "Host" : undefined)
        };
        
        const res = await apiRequest("POST", "/api/photos", data);
        return res.json();
      } finally {
        setIsUploading(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}/photos`] });
    }
  });

  // Handle file upload for mobile devices that don't support webcam
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      // Convert file to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        
        try {
          // Compress the image
          const compressedImage = await compressImage(base64String, 0.7);
          
          // Apply filter to the image
          const filteredImage = await applyFilter(compressedImage, filter);
          
          // Upload the image
          mutate(filteredImage);
        } catch (error) {
          console.error("Error processing file:", error);
          setCameraError("Failed to process the image. Please try again.");
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error processing file:", error);
      setCameraError("Failed to process the image. Please try again.");
      setIsUploading(false);
    }
  };

  // Redirect to registration if user is not registered and not the host
  if (!userInfo && !isHost) {
    return (
      <div className="space-y-4">
        <div className="p-4 text-center bg-amber-100 text-amber-600 rounded-lg">
          <p className="mb-2">You need to register before taking photos.</p>
          <Button onClick={() => navigate(`/event/register/${eventId}`)}>
            Register Now
          </Button>
        </div>
      </div>
    );
  }

  // Check if user has reached their photo limit
  if (userPhotos.length >= photoLimit) {
    return (
      <div className="space-y-4">
        <div className="p-4 text-center bg-red-100 text-red-600 rounded-lg">
          <p>You've reached your limit of {photoLimit} photos for this event.</p>
        </div>
      </div>
    );
  }

  // Show camera permission request
  if (cameraPermission === "prompt" || cameraPermission === "checking") {
    return (
      <div className="space-y-4">
        <div className="p-4 text-center bg-blue-100 text-blue-600 rounded-lg">
          <p className="mb-2">Camera access is required to take photos.</p>
          <Button onClick={requestCameraPermission}>
            Allow Camera Access
          </Button>
        </div>
      </div>
    );
  }

  // Show error if camera permission is denied
  if (cameraPermission === "denied") {
    return (
      <div className="space-y-4">
        <div className="p-4 text-center bg-red-100 text-red-600 rounded-lg">
          <p className="mb-2">Camera access was denied. Please enable camera access in your browser settings.</p>
          <div className="flex flex-col gap-2">
            <Button onClick={requestCameraPermission}>
              Try Again
            </Button>
            <p className="text-sm mt-2">Or upload a photo instead:</p>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              capture="environment"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button 
              variant="outline" 
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Photo
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const capture = async () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      try {
        setIsUploading(true);
        // Compress the image
        const compressedImage = await compressImage(imageSrc, 0.7);
        
        // Apply filter to the compressed image
        const filteredImage = await applyFilter(compressedImage, filter);
        
        // Upload the image
        mutate(filteredImage);
      } catch (error) {
        console.error("Error capturing photo:", error);
        setCameraError("Failed to capture photo. Please try again.");
        setIsUploading(false);
      }
    } else {
      setCameraError("Could not access camera. Please check permissions and try again.");
    }
  };

  const handleCameraError = (error: string | DOMException) => {
    console.error("Camera error:", error);
    setCameraError("Camera access error. Please check your permissions and try again.");
    setShowWebcam(false);
  };

  const resetCamera = () => {
    setCameraError(null);
    setShowWebcam(false);
    
    // Request camera permission again
    setTimeout(() => {
      requestCameraPermission();
    }, 500);
  };

  // Get the display name - either from userInfo or "You (Host)" if isHost is true
  const displayName = userInfo?.userName || (isHost ? "You (Host)" : "Guest");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2 px-2">
        <div className="flex items-center">
          {isHost ? (
            <Crown className="w-5 h-5 mr-2 text-amber-500" />
          ) : (
            <UserCircle className="w-5 h-5 mr-2" />
          )}
          <span className="text-sm font-medium">{displayName}</span>
        </div>
        <div className="text-sm text-muted-foreground">
          Your Photos: {userPhotos.length}/{photoLimit}
        </div>
      </div>
      
      {cameraError && (
        <div className="p-3 bg-red-100 text-red-600 rounded-lg text-sm mb-2">
          <p>{cameraError}</p>
          <div className="flex flex-col gap-2 mt-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={resetCamera}
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Reset Camera
            </Button>
            
            <p className="text-xs mt-1">If camera issues persist, try uploading a photo:</p>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              capture="environment"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-4 h-4 mr-1" />
              Upload Photo
            </Button>
          </div>
        </div>
      )}
      
      <div className="relative aspect-[3/4] bg-black rounded-lg overflow-hidden">
        {showWebcam ? (
          <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            className="absolute inset-0 w-full h-full object-cover"
            videoConstraints={{
              facingMode: facingMode,
              width: { ideal: 1280 },
              height: { ideal: 720 }
            }}
            onUserMediaError={handleCameraError}
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
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Button onClick={requestCameraPermission}>
              <Camera className="mr-2 h-5 w-5" />
              Enable Camera
            </Button>
          </div>
        )}
        
        {showWebcam && (
          <Button
            variant="secondary"
            size="sm"
            className="absolute top-2 right-2 bg-black/50 hover:bg-black/70"
            onClick={() => setFacingMode(prev => prev === "user" ? "environment" : "user")}
          >
            Switch Camera
          </Button>
        )}
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

      <div className="flex gap-2">
        <Button 
          className="flex-1" 
          onClick={capture}
          disabled={isPending || !showWebcam || isUploading}
        >
          {isUploading ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              Uploading...
            </>
          ) : (
            <>
              <Camera className="mr-2 h-4 w-4" />
              Take Photo
            </>
          )}
        </Button>
        
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          capture="environment"
          onChange={handleFileUpload}
          className="hidden"
        />
        <Button 
          variant="outline" 
          onClick={() => fileInputRef.current?.click()}
          disabled={isPending || isUploading}
        >
          <Upload className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
