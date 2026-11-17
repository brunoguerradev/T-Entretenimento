# Passo a passo: publicar a T pelo Git™ Version Control do cPanel

Fluxo final: você altera o site no computador → envia para o GitHub → no cPanel
clica em **Update from Remote** e **Deploy HEAD Commit** → o site está no ar.

```
computador  ──push──▶  GitHub  ──Update from Remote──▶  cPanel (repositório)  ──Deploy──▶  public_html
```

Tempo da primeira vez: uns 20 minutos. Depois, cada atualização leva 1 minuto.

---

## Etapa 0 – Pasta do domínio (já configurada)

A raiz do documento do domínio da T no cPanel é **`public_html/tentretenimento.com.br`**.
O `.cpanel.yml` (na raiz do projeto) já aponta para ela:

```yaml
- export DEPLOYPATH=$HOME/public_html/tentretenimento.com.br/
```

`$HOME` é a pasta da conta (`/home/usuario`), então não é preciso escrever o usuário do
cPanel. Se um dia o domínio mudar de pasta, troque só essa linha (termine sempre com `/`).

---

## Etapa 1 – Criar o repositório no GitHub

1. Entre em https://github.com/new
2. *Repository name*: `T-Entretenimento` (já criado, privado)
3. Escolha **Public** ou **Private**:
   - **Public** (mais simples): o cPanel clona sem chave. O código de um site estático
     já é visível para qualquer visitante, então não há segredo exposto.
   - **Private**: exige a chave da Etapa 3. Use se não quiser o código listado no GitHub.
4. **Não** marque "Add a README", ".gitignore" nem "license" (o projeto já tem os arquivos).
5. *Create repository*. Copie o endereço que aparece:
   - Público: `https://github.com/brunoguerradev/T-Entretenimento.git`
   - Privado: `git@github.com:brunoguerradev/T-Entretenimento.git` (aba **SSH**)

---

## Etapa 2 – Enviar o projeto do computador para o GitHub

Pelo **GitHub Desktop** (já instalado nesta máquina):
1. *File › Add local repository* › escolha a pasta `T Entretenimento`.
2. Se ele disser que não é um repositório, clique em *create a repository* (branch `main`).
3. Confira a lista de arquivos: **não** pode aparecer a pasta `.claude` nem `.zip`
   (o `.gitignore` já tira os dois).
4. Escreva o resumo `Site da T Entretenimento` › *Commit to main*.
5. *Publish repository* (ou *Push origin*), apontando para o repositório da Etapa 1.

Ou pelo terminal, na pasta do projeto:
```bash
git init -b main
git add .
git commit -m "Site da T Entretenimento"
git remote add origin https://github.com/brunoguerradev/T-Entretenimento.git
git push -u origin main
```

---

## Etapa 3 – Só para repositório PRIVADO: chave de acesso do cPanel ao GitHub

1. cPanel › **Acesso SSH** (SSH Access) › *Gerenciar chaves SSH* › **Gerar uma nova chave**.
   - *Nome da chave*: deixe `id_rsa` (o Git do cPanel usa a chave com esse nome).
   - *Senha da chave*: **deixe em branco** (o cPanel não consegue usar chave com senha).
   - Tipo RSA, tamanho 4096 › *Gerar chave*.
2. Volte a *Gerenciar chaves SSH* › em **Chaves públicas**, na `id_rsa.pub`:
   *Gerenciar* › **Autorizar**.
3. Ainda em Chaves públicas › *Exibir/baixar* › copie todo o texto (começa com `ssh-rsa`).
4. No GitHub, no repositório › **Settings › Deploy keys › Add deploy key**:
   - *Title*: `cPanel T Entretenimento`
   - *Key*: cole o texto
   - **Não** marque "Allow write access" (o cPanel só precisa ler).
   - *Add key*.

> Se na Etapa 4 aparecer erro de "Host key verification failed", abra
> cPanel › **Terminal** e rode uma vez `ssh -T git@github.com`, respondendo `yes`.
> Se a hospedagem não tiver Terminal nem SSH, use o repositório público ou
> peça ao suporte para liberar o github.com no `known_hosts`.

---

## Etapa 4 – Criar o repositório no cPanel

1. cPanel › **Git™ Version Control** › **Create**.
2. Preencha:
   - **Clone a Repository**: ligado.
   - **Clone URL**: o endereço da Etapa 1 (HTTPS se público, `git@github.com:...` se privado).
   - **Repository Path**: `repositorios/tentretenimento`
     (**fora** do `public_html`: assim os arquivos de trabalho não ficam acessíveis pela web).
   - **Repository Name**: `T Entretenimento`.
3. **Create**. O cPanel baixa o repositório (pode levar alguns segundos).

---

## Etapa 5 – Antes do primeiro deploy

1. **Backup**: *Gerenciador de Arquivos* › pasta do domínio › selecione tudo ›
   *Compactar* › baixe o .zip.
2. **SSL**: *SSL/TLS Status* › selecione o domínio › **Run AutoSSL**. Espere ficar
   verde (o `.htaccess` força `https://`).
3. Se a pasta do domínio tiver um `index.php` ou página padrão da hospedagem
   ("default.html", "cgi-bin" pode ficar), apague para não competir com o `index.html`.

---

## Etapa 6 – Publicar (Deploy)

1. cPanel › **Git™ Version Control** › na linha do repositório, **Manage**.
2. Aba **Pull or Deploy**.
3. Confira em *HEAD Commit* que aparece o seu último commit.
4. Clique em **Deploy HEAD Commit**.
5. Abra o domínio da T no navegador. 🎉

> O botão *Deploy* só aparece se o `.cpanel.yml` estiver na raiz do repositório e
> se não houver alteração "solta" no repositório do servidor (nunca edite arquivos
> dentro de `repositorios/tentretenimento` pelo Gerenciador de Arquivos).

---

## Toda vez que mudar o site

1. No computador: commit + push (GitHub Desktop: *Commit to main* › *Push origin*).
2. cPanel › Git™ Version Control › *Manage* › *Pull or Deploy*:
   **Update from Remote** e depois **Deploy HEAD Commit**.
3. Mudou CSS ou JS? Aumente o `?v=N` nos HTML antes do commit.

---

## Conferir depois do deploy

- [ ] `https://dominio/` abre com cadeado.
- [ ] `/ingressos/`, `/painel/` e `/portaria/` abrem.
- [ ] O formulário abre o WhatsApp (42) 98407-9999.
- [ ] A assinatura "Desenvolvido por foxes." aparece no rodapé.
- [ ] Painel e portaria protegidos: cPanel › **Privacidade do diretório** ›
      `painel` e `portaria` › *Proteger com senha* + criar usuário.

## Se der errado

| Sintoma | Causa provável | O que fazer |
|---|---|---|
| Botão *Deploy HEAD Commit* desabilitado | falta `.cpanel.yml` na raiz ou há mudanças locais no repositório do servidor | confira o arquivo no GitHub; não edite a pasta `repositorios/` |
| Deploy "ok" mas site não muda | `DEPLOYPATH` errado | confira usuário e pasta no `.cpanel.yml` (termina com `/`) |
| Erro 500 | `.htaccess` incompatível com a hospedagem | renomeie para `.htaccess-off` pelo Gerenciador e avise |
| "Too many redirects" | SSL ainda não ativo, ou proxy (Cloudflare) | rode o AutoSSL; no Cloudflare use SSL "Full" |
| Site antigo ainda aparece | cache do navegador | Ctrl+F5, ou aumente o `?v=N` |
| Ver o que o deploy fez | — | `Manage › Pull or Deploy › Last Deployment Information` |
