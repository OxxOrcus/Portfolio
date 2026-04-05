from bs4 import BeautifulSoup
import sys

def check_file(filename):
    with open(filename, 'r') as f:
        soup = BeautifulSoup(f.read(), 'html.parser')

    links = soup.find_all('a', target="_blank")
    vulnerable_links = []
    for link in links:
        rel = link.get('rel', [])
        if isinstance(rel, str):
            rel = rel.split()

        if 'noopener' not in rel or 'noreferrer' not in rel:
            vulnerable_links.append(link)

    print(f"{filename}: Found {len(vulnerable_links)} vulnerable links out of {len(links)} external links")

check_file('digital-service.html')
check_file('index.html')
