import Image from "next/image";

export const Visa = () => (
  <div className="relative w-[48px] h-[30px] bg-white rounded-[4px] border border-gray-200 overflow-hidden flex-shrink-0 shadow-sm">
    <Image src="/payment/visa.png" alt="Visa" fill className="object-contain scale-[1.2]" sizes="48px" />
  </div>
);

export const Mastercard = () => (
  <div className="relative w-[48px] h-[30px] bg-white rounded-[4px] border border-gray-200 overflow-hidden flex-shrink-0 shadow-sm">
    <Image src="/payment/mastercard.png" alt="Mastercard" fill className="object-contain scale-[1.35]" sizes="48px" />
  </div>
);

export const MPesa = () => (
  <div className="relative w-[48px] h-[30px] bg-white rounded-[4px] border border-gray-200 overflow-hidden flex-shrink-0 shadow-sm">
    <Image src="/payment/mpesa.png" alt="M-Pesa" fill className="object-contain scale-[1.25]" sizes="48px" />
  </div>
);

export const AirtelMoney = () => (
  <div className="relative w-[48px] h-[30px] bg-white rounded-[4px] border border-gray-200 overflow-hidden flex-shrink-0 shadow-sm">
    <Image src="/payment/airtel.png" alt="Airtel Money" fill className="object-contain scale-[1.25]" sizes="48px" />
  </div>
);
