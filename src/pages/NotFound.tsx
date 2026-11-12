import { Compass } from 'lucide-react'
import { ButtonLink, EmptyState } from '../components/ui'

export default function NotFound() {
  return (
    <div className="pt-10">
      <EmptyState icon={Compass} title="Não encontramos esta página" action={<ButtonLink to="/">Voltar ao início</ButtonLink>}>
        O link pode ter mudado. Se precisar de apoio agora, use o botão "Preciso de ajuda agora".
      </EmptyState>
    </div>
  )
}
