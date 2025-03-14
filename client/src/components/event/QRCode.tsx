import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent } from "@/components/ui/card";

interface Props {
  eventId: number;
}

export default function QRCode({ eventId }: Props) {
  const [domain, setDomain] = useState("");

  useEffect(() => {
    // Use your local IP address instead of localhost
    // This allows mobile devices on the same network to access your server
    const localIpAddress = "192.168.0.89:5000";
    setDomain(`http://${localIpAddress}`);
  }, []);

  // Link to the registration page instead of directly to the event
  const registrationUrl = `${domain}/event/register/${eventId}`;

  return (
    <Card>
      <CardContent className="p-6 flex flex-col items-center">
        <div className="bg-white p-4 rounded-lg">
          <QRCodeSVG value={registrationUrl} size={200} />
        </div>
        <p className="mt-4 text-sm text-center">
          Scan this QR code to join the event and start taking photos!
        </p>
        <p className="mt-2 text-xs text-center text-muted-foreground">
          Users will be prompted to enter their name before joining.
        </p>
        <p className="mt-2 text-xs text-center text-blue-500">
          URL: {registrationUrl}
        </p>
      </CardContent>
    </Card>
  );
}