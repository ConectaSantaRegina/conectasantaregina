# Orientação após o cadastro

- Após concluir os dados obrigatórios da primeira conta, mostrar a pergunta e as duas escolhas solicitadas, apenas uma vez.
- Salvar a conclusão no perfil, inclusive ao dispensar a pergunta. Contas já cadastradas não receberão a pergunta automaticamente.
- Em “Sim”, apresentar as quatro opções e abrir os formulários existentes, sem alterar suas regras de aprovação. Após enviar, voltar ao início; abandonar o formulário não bloqueia a navegação.
- Em “Não”, fechar e voltar ao início.
- Acrescentar a chamada de cadastro gratuito abaixo da apresentação inicial. Visitantes passam pelo Google e continuam na mesma sequência.
- Preservar cores, fontes e botões, com textos que cabem no celular e aviso de gratuito versus Premium.

## Detalhes técnicos

- Campo privado `profiles.onboarding_concluido`, com preenchimento para contas anteriores.
- Fluxo compartilhado no layout principal, reutilizando os campos e o formulário de publicação existentes.
- Testes das condições de primeira exibição e das quatro categorias; verificação de envio real, persistência e apresentação móvel.