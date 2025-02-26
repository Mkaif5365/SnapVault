import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent } from "@/components/ui/card";

interface Props {
  eventId: number;
}

export default function QRCode({ eventId }: Props) {
  const [domain, setDomain] = useState("");

  useEffect(() => {
    const domains = import.meta.env.REPLIT_DOMAINS?.split(",") || [];
    setDomain(domains[0] || window.location.origin);
  }, []);

  const eventUrl = `${domain}/event/${eventId}`;

  return (
    <Card>
      <CardContent className="p-6 flex flex-col items-center">
        <div className="bg-white p-4 rounded-lg">
          <QRCodeSVG value={eventUrl} size={200} />
        </div>
        <p className="mt-4 text-sm text-center">
          Scan this QR code to join the event and start taking photos!
        </p>
      </CardContent>
    </Card>
  );
}