import { Alert } from "flowbite-react"
import { HiInformationCircle } from "react-icons/hi"

export default function OfflineIndicator() {
  return (
    <div className="sticky top-0 z-50">
      <Alert color="warning" icon={HiInformationCircle}>
        <span className="font-medium">Modo Offline</span> Estás viendo contenido guardado en caché. Algunas funciones
        pueden no estar disponibles.
      </Alert>
    </div>
  )
}
