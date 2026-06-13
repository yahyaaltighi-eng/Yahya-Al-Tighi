// تحميل Payload الافتراضي
fetch('sample_payload.json').then(r => r.text()).then(txt => document.getElementById('payloadInput').value = txt);

async function runGeneration() {
    const btn = document.getElementById('genBtn');
    const loading = document.getElementById('loading');
    const resultPanel = document.getElementById('resultPanel');
    const jsonResult = document.getElementById('jsonResult');

    btn.disabled = true;
    loading.classList.remove('hidden');
    resultPanel.classList.add('hidden');

    try {
        const payload = JSON.parse(document.getElementById('payloadInput').value);
        // تأكد أن الرابط يطابق الخادم المحلي أو السحابي
        const response = await fetch('https://8000-it3iyatlhi0qodypa9hsr-3428df89.us3.manus.computer/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        const data = await response.json();
        jsonResult.textContent = JSON.stringify(data, null, 4);
    } catch (err) {
        jsonResult.textContent = "خطأ في الاتصال بالخادم أو صيغة JSON غير صالحة: \n" + err.message;
    } finally {
        btn.disabled = false;
        loading.classList.add('hidden');
        resultPanel.classList.remove('hidden');
    }
}
