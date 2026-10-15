import { Icon } from '@/components/ui/Icon'
import { waLinkGeneric } from '@/lib/whatsapp'

export function WhatsAppFab() {
  return (
    <a
      href={waLinkGeneric()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribinos por WhatsApp"
      className="fixed bottom-5 right-5 z-[250] grid size-14 animate-pulse-ring place-items-center rounded-full bg-wa text-[#04210f] shadow-xl transition-transform hover:scale-110"
    >
      <Icon name="whatsapp" size={28} />
    </a>
  )
}
