# Conteúdo: fatos, decisões de produto e pendências

Este documento separa três camadas, como pede a base de conhecimento sobre a Rosa:

1. **Fatos sobre a Rosa**: usados como estão.
2. **Decisões de produto**: propostas do app, que a Rosa pode mudar.
3. **Pendências**: dependem de material ou aprovação. Ficam como configuração explícita, nunca como suposição.

## 1. Fatos sobre a Rosa (usados no app)

- Nome público e marca: Rosa Neves. Monograma RN.
- Apresentação: psicoterapeuta, professora, palestrante e especialista em comportamento humano.
- Mais de 15 anos de experiência em desenvolvimento humano.
- Foco em ansiedade, regulação emocional e padrões de comportamento.
- Criadora do Método INTEGRA (integração entre mente, corpo e comportamento).
- Instagram atual: @rosanevespsi. Os perfis antigos (@rosanevespsico, @rosanevespc) **não** são usados.
- Paleta: azul suave, off-white, bege, rosé terroso, sálvia, com o azul-petróleo do monograma.

Texto de "Conheça a Rosa": o texto-base da própria base de conhecimento, sem acréscimos.

## 2. Decisões de produto (revisáveis)

- **Perceber → Regular → Agir**: organização proposta pelo app, apresentada como "um jeito de usar o app", não como fórmula oficial do método.
- **Quatro caminhos INTEGRA** (Emoções, Corpo, Mente, Valores e sentido): baseados nas dimensões que a Rosa descreveu. Espiritualidade só aparece se a pessoa ativar.
- **Textos das 12 situações, das 29 práticas e das 3 trilhas**: escritos para o app na linguagem da Rosa (situação humana primeiro, frase curta, sem travessões, sem promessas).
- **Forma de tratamento**: feminino, masculino ou neutro, escolhida pela pessoa. O público principal são mulheres, mas o app não exclui ninguém.
- **Personalização**: regras simples e explicadas na tela (`src/lib/recommend.ts`). Nenhum "tipo de ansiedade", nenhuma pontuação.

## 3. Pendências

| Item | Situação no app | Onde mudar |
| --- | --- | --- |
| Fotos da Rosa | Três retratos em uso (escolhidos pela Rosa em 12/11/2026). O pacote avisa que são referências visuais e que algumas podem ter sido compostas digitalmente. **Confirmar semelhança e direito de uso antes de publicar** | `src/config/contact.ts` (`photosApproved`, `rosaPhotos`) e `src/config/brand.ts` (`photoApproved`) |
| Logo definitiva | Monograma RN do pacote, com fundo removido | `public/brand/monograma-rn.webp` e `simbolo-rn.webp` |
| Registro profissional, formação | Não exibidos | `src/config/brand.ts` (`rosaProfile.pending`) |
| Link do checkout Kiwify | Vazio → "Em breve" | `.env.local` (`VITE_CHECKOUT_URL`) |
| Nome do material | "Ansiedade: Mente, Corpo e Respiração" (escolhido em 12/11/2026). O quiz publicado continua como SOS Ansiedade | `src/config/commerce.ts` |
| O que o material de R$ 29,90 entrega | Benefícios copiados da oferta já publicada no quiz. Confirmar se correspondem à entrega real (8 ou 12 técnicas, bônus) | `src/config/commerce.ts` |
| Verificação de compra / área paga no app | Não existe. Precisa de backend com login e confirmação da Kiwify (webhook) | Ver `docs/ARQUITETURA.md` |
| Contato e atendimentos | WhatsApp +55 35 99100-7594, consulta R$ 120,00, acompanhamento mensal R$ 500,00 (sem número de encontros), palestras sem preço público | `src/config/contact.ts` |
| Áudios guiados | Não existem. O app usa só texto e animação | Adicionar só com áudio real e autorizado |
| Validação das práticas | Ver a tabela abaixo | `src/content/exercises.ts` (`reviewStatus`, `autoRecommend`) |

## Quiz SOS Ansiedade → primeiros passos

**Preservado do quiz** (perguntas e respostas): nível habitual de 0 a 10, frequência, momento
em que mais aparece, o que sente primeiro, o que já tentou, evitação, como se sente consigo,
frustração, o que mudaria na rotina, "já ouviu falar que a ansiedade é uma reação automática",
nome (agora opcional).

**Ajustado**, com o motivo:

| No quiz | No app | Por quê |
| --- | --- | --- |
| Gênero (Mulher/Homem) | "Como prefere que o app fale com você?" (feminino, masculino, neutro) | Só serve para o texto. Inclui quem não se identifica com as duas opções |
| Idade | Não é perguntada | Dado desnecessário (privacidade) |
| "Não sou capaz de gerir meu tempo com eficiência" (caminho Respiração) | "A respiração fica curta e o peito aperta" | A resposta original não descreve um sinal da ansiedade. O texto novo vem do resultado Respiração do próprio quiz. **Confirmar com a Rosa** |
| "Sim, as vezes" | "Sim, às vezes" | Acentuação |
| "De 0 a 10, o quanto você quer resolver isso agora?" | Removida | É pergunta de venda, não de cuidado |
| Leituras simuladas ("Padrão de tensão confirmado", "Sinal identificado") | Removidas | Não têm base nas respostas |
| Gráfico "Você x Normal" | Removido | Comparação sem base, gera medo |
| "O corpo reage primeiro, e a mente segue o corpo" / "Sua porta é..." | "Pelas suas respostas, você nota primeiro pelo corpo/mente/respiração. Por isso começamos por..." | A base pede para não afirmar que o corpo sempre reage primeiro |
| "O que pode desligar ela mais rápido" | Pausas de conteúdo sem promessa | Sem promessa de resultado |

**Novas perguntas pedidas para o app**: o que está mais difícil hoje (até 3 situações),
desconforto agora (0 a 10, com "Ainda não sei"), práticas curtas ou longas.

## As 12 técnicas do catálogo SOS: avaliação

| Técnica | No app | Recomendação automática | Observação |
| --- | --- | --- | --- |
| Visão periférica | Sim | Sim | Baixo risco, pouca pesquisa específica. Revisão necessária |
| Distanciamento | Sim | Sim | Base em técnicas de distanciamento cognitivo |
| "E daí se...?" | Sim | Sim | Só com preocupações moderadas. Revisão necessária |
| Suspiro fisiológico | Sim | Sim | Poucas repetições, sem forçar. Revisão necessária |
| Respiração cadenciada | Sim | Sim | Expiração mais longa, **sem retenção**. Revisão necessária |
| Grounding | Sim (5-4-3-2-1) | Sim | Baixo risco |
| Relaxamento de mandíbula | Sim | Sim | Baixo risco |
| Estímulo frio | Versão suave (água fresca nos pulsos e no rosto) | **Não** | Sem gelo ou imersão. Aviso cardíaco |
| Estimulação bilateral | Como recurso de atenção | **Não** | Usada em abordagens clínicas com profissional |
| Butterfly Reset | Como gesto de autocuidado | **Não** | Mesma razão |
| Tapping | Como recurso de atenção | **Não** | Evidência limitada e discutida |
| Backward Spin | Experimental, com aviso | **Não** (nem no botão de ajuda) | Evidência incerta. A Rosa decide se fica |

Os testes garantem que essas cinco técnicas nunca entrem em recomendação automática.
