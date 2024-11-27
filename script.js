// Lấy các phần tử cần thiết
const sendButton = document.getElementById('send-button');
const userInput = document.getElementById('user-input');
const messagesDiv = document.getElementById('messages');

// Hàm thêm tin nhắn vào giao diện
function addMessage(content, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender);

    // Nếu bot trả về code block, xử lý để hiển thị đẹp
    if (sender === 'bot' && content.includes("```")) {
        const formattedContent = content.replace(/```([\s\S]+?)```/g, '<pre><code>$1</code></pre>');
        messageDiv.innerHTML = formattedContent;
    } else {
        messageDiv.textContent = content;
    }

    messagesDiv.appendChild(messageDiv);

    // Highlight code block nếu có
    document.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightBlock(block);
    });

    // Tự động cuộn xuống cuối
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Hàm gửi yêu cầu tới API
async function sendMessage() {
    const apiKey = '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'; // API Key của bạn
    const userMessage = userInput.value.trim();
    if (!userMessage) return;

    // Hiển thị tin nhắn của người dùng
    addMessage(userMessage, 'user');
    userInput.value = '';

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: 'Bạn là một trợ lý AI thông minh và thân thiện.' },
                    { role: 'user', content: userMessage }
                ],
                max_tokens: 200,
                temperature: 0.7
            }),
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Lỗi 401: API Key không hợp lệ. Vui lòng kiểm tra lại API Key.');
            } else if (response.status === 429) {
                throw new Error('Lỗi 429: Vượt quá giới hạn yêu cầu. Vui lòng thử lại sau.');
            } else {
                throw new Error(`Lỗi ${response.status}: ${response.statusText}`);
            }
        }

        const data = await response.json();

        // Kiểm tra dữ liệu trả về có hợp lệ không
        if (data.choices && data.choices.length > 0) {
            const botReply = data.choices[0].message.content;
            addMessage(botReply, 'bot');
        } else {
            throw new Error('API không trả về dữ liệu hợp lệ.');
        }
    } catch (error) {
        console.error('Chi tiết lỗi:', error);
        addMessage(error.message, 'bot'); // Hiển thị lỗi lên giao diện
    }
}

// Gửi tin nhắn khi nhấn nút hoặc Enter
sendButton.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        sendMessage();
    }
});
