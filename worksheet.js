const OPENAI_KEY = atob('c2stcHJvai1iaVZ3N2Yya2hHWjh3emtPYnA4c2s5VUVnbTdJcGtBaXVNVUZxQTEzNWlmVzA2MF9rdDNERGdJTG8xM3haWjBmdkJXZW1NZDZ5VDNCMWJrRkpWaXl2cVk4N0VMMFVDNUdyanN5M2YxRENuTTdfbXFmN1BJdmp3d2pLX2JqOHE1MXZUSDMxek16aUpkdWZLZUlXMVk3SVVmZFY4QQ==');


async function generate() {
  // Clear old messages
  document.getElementById('msg').innerHTML = '';

  // Inputs
  const topic = document.getElementById('topic').value.trim();
  const grade = document.getElementById('grade').value;
  const num = document.getElementById('num').value;
  const style = document.getElementById('style').value;

  // Validation
  if (!topic) return showMsg('Enter a topic', 'error');
  
  // Show loading spinner
  const btn = document.querySelector('button');
  btn.disabled = true;
  btn.innerHTML = `<span class="spin">⚙️</span> Building...`;

  try {
    const prompt = `
Create a ${style} worksheet about "${topic}" for grade ${g}.
Include ${n} questions.
After the questions, add a section "Answer Key" with correct answers.
Label the student section "Name: ___________   Date: ___________".
Format clearly with numbered questions.
`.trim();

    const text = await callOpenAI(prompt);
    buildPDF(text);
    showMsg('✅ Success! PDF downloaded.', 'success');
  } catch (e) {
    showMsg(`❌ Error: ${e.message}`, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Generate PDF';
  }
}

async function callOpenAI(prompt) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 1500
    })
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'OpenAI failed');
  }

  const json = await res.json();
  return json.choices[0].message.content;
}

function buildPDF(text) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'pt', format: 'letter', lineHeight: 1.2 });
  
  // Title
  doc.setFontSize(16);
  doc.text('Worksheet', 40, 60);
  
  // Student header
  doc.setFontSize(12);
  doc.text('Name: _____________________   Date: ___________', 40, 90);
  
  // Body
  const body = doc.splitTextToSize(text, 500);
  doc.text(body, 40, 120);
  
  // Footer
  doc.setFontSize(10);
  doc.text('Generated with Worksheet Wizard', 40, 750);
  
  // Download
  const slug = document.getElementById('topic').value.trim().replace(/\W+/g, '-');
  doc.save(`${slug}-worksheet.pdf`);
}

function showMsg(text, type) {
  const msg = document.getElementById('msg');
  msg.textContent = text;
  msg.className = type === 'error' ? 'text-red-600' : 'text-green-600';
}
