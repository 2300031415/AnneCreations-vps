import React from 'react'
import Whatsap_icon from "../../public/whatsapp.png"
import Image from 'next/image'
import { whatsappUrl } from '@/lib/constants'

const whatsapp_icon = () => {
  return (
    <div className="fixed bottom-50 right-5 z-50 flex flex-col gap-3 items-center">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
      >
        <Image
          src={Whatsap_icon}
          alt="WhatsApp"
          width={42}
          height={42}
        />
      </a>
    </div>
  )
}

export default whatsapp_icon

