# Publicação do site da T Entretenimento (hospedagem com cPanel)

O site é 100% estático (HTML, CSS, JS e imagens). Não precisa de PHP, banco de
dados nem Node na hospedagem: basta colocar os arquivos na pasta pública do domínio.

**O que vai para o ar:** `index.html`, `.htaccess`, `robots.txt` e as pastas
`assets`, `css`, `js`, `ingressos`, `painel` e `portaria`.
**O que não vai:** `.claude/`, `deploy/`, `.cpanel.yml`, `.gitignore`.

---

## Antes da primeira publicação

1. **Pasta do domínio:** `public_html/tentretenimento.com.br` (raiz do documento
   do domínio da T no cPanel). É nela que vão os arquivos.
2. **Faça backup do que está lá hoje.** Em *Gerenciador de Arquivos*, selecione
   o conteúdo da pasta, *Compactar* e baixe o .zip. (Hoje o domínio responde 403.)
3. **SSL.** Em *SSL/TLS Status*, rode o *AutoSSL* para o domínio. O `.htaccess`
   redireciona tudo para `https://`, então o certificado precisa estar ativo antes.

---

## Opção A – Pelo Gerenciador de Arquivos (mais simples)

1. Na pasta do projeto, gere o pacote:
   ```
   python deploy/empacotar.py
   ```
   Sai `deploy/tentretenimento.zip` (só os arquivos do site).
2. No cPanel › *Gerenciador de Arquivos*, abra a pasta do domínio.
3. Ative *Configurações › Mostrar arquivos ocultos* (para ver o `.htaccess`).
4. *Carregar* o .zip › clique nele com o botão direito › *Extract* na mesma pasta.
5. Apague o .zip do servidor.

Para atualizar depois: gere o pacote de novo e repita (o Extract sobrescreve).

---

## Opção B – Pelo "Git™ Version Control" do cPanel (deploy com um clique)

**Guia completo, tela a tela: [PASSO-A-PASSO-GIT-CPANEL.md](PASSO-A-PASSO-GIT-CPANEL.md).** Resumo:

Usa o arquivo `.cpanel.yml` da raiz do projeto, que copia só os arquivos do site
para a pasta pública.

1. O `.cpanel.yml` já aponta para `$HOME/public_html/tentretenimento.com.br/`.
2. Coloque o projeto num repositório Git (GitHub privado, por exemplo) e faça
   commit de tudo, inclusive `.cpanel.yml` e `.htaccess`.
3. No cPanel › *Git™ Version Control* › *Create*:
   - *Clone a Repository*: ligado;
   - *Clone URL*: o endereço do repositório (repositório privado precisa de uma
     chave SSH do cPanel cadastrada como *deploy key* no GitHub);
   - *Repository Path*: uma pasta **fora** do public_html, ex. `repositorios/tentretenimento`.
4. Em *Manage › Pull or Deploy*: *Update from Remote* e depois **Deploy HEAD Commit**.

Para atualizar depois: commit + push no Git, e no cPanel *Update from Remote* +
*Deploy HEAD Commit*.

---

## Depois de publicar, conferir

- Página inicial, `/ingressos/`, `/painel/` e `/portaria/` abrindo com https.
- Formulário de contato abre o WhatsApp (42) 98407-9999.
- A portaria pede a câmera (só funciona em https).

## Atenção: o painel e a portaria são do protótipo

Eles não têm login e os dados ficam só no navegador de quem abre. Enquanto for
protótipo, proteja as duas pastas com senha pelo cPanel:
*Privacidade do diretório* (Directory Privacy) › `painel` e `portaria` › ativar
senha e criar um usuário.

## Cache

Ao mudar CSS ou JS, aumente o `?v=N` nos links dos HTML para os navegadores
baixarem a versão nova.
