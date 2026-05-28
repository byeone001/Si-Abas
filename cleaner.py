import sys, re

def clean_file(filepath, outpath):
    with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
        text = f.read()
    
    prev = None
    while text != prev:
        prev = text
        text = re.sub(r'[^\x08]\x08', '', text)
    
    # Remove any remaining backspaces
    text = text.replace('\x08', '')
    
    with open(outpath, 'w', encoding='utf-8') as f:
        f.write(text)

clean_file(sys.argv[1], sys.argv[2])
