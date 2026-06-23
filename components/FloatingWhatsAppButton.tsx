"use client";

import Link from "next/link";

export default function FloatingWhatsAppButton() {
  const whatsappUrl =
    process.env.NEXT_PUBLIC_WHATSAPP_URL?.trim() ||
    "https://wa.me/918860330771?text=Hi%20SocialRUSH%2C%20I%20need%20help%20with%20social%20media%20growth.";

  return (
    <Link
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-24 right-5 z-[68] flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-lg transition hover:scale-110 hover:shadow-xl sm:bottom-24 sm:right-6"
      title="Chat with us on WhatsApp"
    >
      <svg
        className="h-7 w-7"
        fill="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-4.781 1.158l-.002.001-.183.102-1.898-.5.51 1.862-.12.192a9.306 9.306 0 00-1.286 4.477c0 5.338 4.35 9.688 9.689 9.688 2.594 0 5.039-.954 6.859-2.887 1.821-1.933 2.822-4.518 2.822-7.201 0-5.339-4.35-9.688-9.689-9.688" />
      </svg>
    </Link>
  );
}
