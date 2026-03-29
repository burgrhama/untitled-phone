with open('index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find connectAudioAnalyser
for i, line in enumerate(lines):
    if 'connectAudioAnalyser' in line:
        print(f"Line {i}: {line.strip()}")
        if 'function' in line:
            # Print next 15 lines
            for j in range(i, min(i+15, len(lines))):
                print(f"  {j}: {lines[j].rstrip()}")
            print("\n---\n")
