"""Gera deploy/t-entretenimento-site.zip com só os arquivos do site,
para enviar pelo Gerenciador de Arquivos do cPanel (Upload > Extract).

Uso, na pasta do projeto:  python deploy/empacotar.py
"""
import pathlib
import zipfile

RAIZ = pathlib.Path(__file__).resolve().parent.parent
ITENS = ["index.html", ".htaccess", "robots.txt", "assets", "css", "js", "ingressos", "painel", "portaria"]
DESTINO = RAIZ / "deploy" / "t-entretenimento-site.zip"


def main() -> None:
    total = 0
    with zipfile.ZipFile(DESTINO, "w", zipfile.ZIP_DEFLATED) as zf:
        for item in ITENS:
            caminho = RAIZ / item
            if not caminho.exists():
                raise SystemExit(f"Faltou {item} na pasta do projeto.")
            arquivos = [caminho] if caminho.is_file() else sorted(p for p in caminho.rglob("*") if p.is_file())
            for arq in arquivos:
                zf.write(arq, arq.relative_to(RAIZ).as_posix())
                total += 1
    print(f"Pacote pronto: {DESTINO} ({total} arquivos, {DESTINO.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
