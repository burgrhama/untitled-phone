with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

old_audio = '<audio id="audioPlayer" controls style="width:100%; margin-top:8px;"></audio>'
new_audio = '<audio id="audioPlayer" controls style="width:100%; margin-top:8px;" crossorigin="anonymous" preload="auto"></audio>'

content = content.replace(old_audio, new_audio)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated audio element attributes")
