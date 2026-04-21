import json, io, base64
import matplotlib
matplotlib.use('agg') 
import matplotlib.pyplot as plt
from js import document, window

# We get data from the window context (in react code) as we learned in class :).
data = json.loads(window.__pyodideData)

names = [d['name'] for d in data]
scores = [d['score'] for d in data]

fig, ax = plt.subplots(figsize=(6, 4))
ax.bar(names, scores, color='skyblue', edgecolor='blue')
ax.set_title('Player Scores')
ax.set_ylabel('Scores')

buf = io.BytesIO()
fig.savefig(buf, format='png')
buf.seek(0)
img_b64 = base64.b64encode(buf.read()).decode('utf-8')
plt.close(fig)

target = document.getElementById('pyodide-target')
target.innerHTML = f'<img src="data:image/png;base64,{img_b64}" alt="Chart" />'