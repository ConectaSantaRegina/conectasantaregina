# Feed comunitário na página inicial

## Objetivo
Criar um feed social na página inicial, logo depois de Destaques, usando as publicações de Novidades já protegidas pelas regras de Premium e aprovação administrativa.

## O que será alterado
- Adicionar uma área **Feed da comunidade** abaixo do carrossel de Destaques.
- Mostrar primeiro a caixa de publicação para contas Premium e administradores.
- Exibir nessa caixa a regra de conteúdo solicitada, de forma clara e visível.
- Abrir o formulário existente de Novidades diretamente pela caixa de publicação, com título, categoria, texto e imagem.
- Informar após o envio que a publicação está aguardando aprovação.
- Exibir abaixo apenas publicações aprovadas, da mais recente para a mais antiga, em cartões verticais com imagem, categoria, texto e data.
- Para visitantes sem Premium, mostrar uma chamada discreta para entrar ou solicitar acesso Premium, sem liberar o formulário.
- Remover o botão de criar publicação da página Novidades; ela continuará servindo para consultar as novidades.
- Manter “Minhas publicações” apenas para visualizar, editar e excluir conteúdos já enviados.

## Regras preservadas
- Somente Premium válido ou administrador pode enviar ao feed.
- Toda nova publicação entra como pendente e só aparece publicamente após aprovação administrativa.
- O carrossel de Destaques continua separado e mostra apenas conteúdos aprovados que atendem às regras de destaque Premium.
- Nenhum dado pessoal ou identificador interno do autor será exposto no feed público.

## Detalhes técnicos
- Reaproveitar a tabela e o formulário de `novidades`, incluindo imagem e categoria.
- Criar componentes próprios para o publicador e para a lista do feed, evitando duplicação com a página de Novidades.
- Ajustar a invalidação da lista após publicar ou aprovar, para o conteúdo aparecer sem inconsistências.
- Validar o resultado em telas de celular e computador, além de conferir compilação e interações principais.
