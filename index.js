// const express = require('express');
// const axios = require('axios');
// const cors = require('cors');
// const { initializeApp } = require('firebase/app');
// const { getFirestore, collection, addDoc, getDocs, query, orderBy } = require('firebase/firestore');

// // Mock OpenAI client for testing without API key
// class MockOpenAI {
//   async createChatCompletion(data) {
//     const { messages } = data;
//     const userMessage = messages[messages.length - 1]?.content || '';
//     if (userMessage.toLowerCase().includes('bedtime story')) {
//       return {
//         choices: [{ message: { content: "Once upon a time, a magical unicorn with a shimmering silver horn led a lost child back home under a starry sky." } }],
//       };
//     }
//     return {
//       choices: [{ message: { content: "Sorry, mock response not available for this query." } }],
//     };
//   }
// }

// const app = express();
// app.use(cors());
// app.use(express.json());

// // Hardcoded configuration
// const GOOGLE_API_KEY = 'AIzaSyDnlKhgsaMf836p3TAlLYt5UuM7VXFKHEM'; // Your Google API key
// const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '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'; // Fallback to env or hardcoded
// const PORT = 5000;

// // Firebase configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyAjHOBdOMBRPTsUC5XA-Ti5Hdvsr3HsrG8",
//   authDomain: "zithara-rudra.firebaseapp.com",
//   projectId: "zithara-rudra",
//   storageBucket: "zithara-rudra.firebasestorage.app",
//   messagingSenderId: "990246342492",
//   appId: "1:990246342492:web:a08d315f5502365a51fb99",
//   measurementId: "G-FVLBQRQDMP"
// };

// const firebaseApp = initializeApp(firebaseConfig);
// const db = getFirestore(firebaseApp);
// console.log('Firestore initialized:', db ? 'Success' : 'Failed');

// if (!db) {
//   console.error('Firebase Firestore initialization failed');
//   process.exit(1);
// }

// // API endpoints
// const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta1/models/gemini-1.5-pro-001:generateContent?key=' + GOOGLE_API_KEY;
// const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// // Mock OpenAI instance
// const mockOpenAI = new MockOpenAI();

// // Mock Inventory Database
// const mockInventory = {
//   'prod1': {
//     name: 'Product 1',
//     stock: 10,
//     price: 29.99,
//     description: 'A high-quality widget.',
//     response: 'Product 1 is in stock with 10 units available at $29.99 each.'
//   },
//   'prod2': {
//     name: 'Product 2',
//     stock: 0,
//     price: 49.99,
//     description: 'A premium gadget.',
//     response: 'Product 2 is currently out of stock. Please check back later.'
//   }
// };

// // Function to check if the question is inventory-related
// function isInventoryQuestion(message) {
//   const inventoryKeywords = ['stock', 'availability', 'product', 'inventory'];
//   return inventoryKeywords.some(keyword => message.toLowerCase().includes(keyword)) ||
//          Object.keys(mockInventory).some(prodId => message.toLowerCase().includes(prodId) || message.toLowerCase().includes(mockInventory[prodId].name.toLowerCase()));
// }

// // Function to get inventory response
// function getInventoryResponse(message) {
//   const prodId = Object.keys(mockInventory).find(id =>
//     message.toLowerCase().includes(id) || message.toLowerCase().includes(mockInventory[id].name.toLowerCase())
//   );
//   return prodId ? mockInventory[prodId].response : 'Sorry, I couldn’t find information about that product.';
// }

// // Function to determine the best API response (for non-inventory questions)
// function getBestResponse(openaiResponse, geminiResponse) {
//   const openaiText = openaiResponse?.choices?.[0]?.message?.content || '';
//   const geminiText = geminiResponse?.candidates?.[0]?.content?.parts?.[0]?.text || '';

//   console.log('OpenAI Response:', openaiText ? openaiText.substring(0, 50) : 'Empty');
//   console.log('Gemini Response:', geminiText ? geminiText.substring(0, 50) : 'Empty');
//   console.log('OpenAI Response Length:', openaiText.length);
//   console.log('Gemini Response Length:', geminiText.length);

//   if (openaiText.length > 0) return { text: openaiText, source: 'OpenAI' };
//   if (geminiText.length > 0) return { text: geminiText, source: 'Gemini' };
//   return { text: 'No valid response from either API', source: 'Fallback' };
// }

// app.post('/api/chat', async (req, res) => {
//   const { message, sessionId } = req.body;

//   const sessionRef = collection(db, `sessions/${sessionId}/messages`);
//   const q = query(sessionRef, orderBy('timestamp', 'asc'));
//   const sessionSnapshot = await getDocs(q);
//   let sessionHistory = sessionSnapshot.docs.map(doc => doc.data());

//   const userMessage = { role: 'user', content: message, timestamp: Date.now() };
//   await addDoc(sessionRef, userMessage);
//   sessionHistory.push(userMessage);

//   try {
//     let botReply, source;

//     // Check if the question is inventory-related
//     if (isInventoryQuestion(message)) {
//       botReply = getInventoryResponse(message);
//       source = 'Inventory Database';
//       console.log(`Inventory Response: ${botReply}`);
//     } else {
//       if (!GOOGLE_API_KEY || !OPENAI_API_KEY) {
//         throw new Error('One or both API keys are missing');
//       }

//       console.log('Attempting API calls with keys:', {
//         GOOGLE_API_KEY: GOOGLE_API_KEY ? 'Set' : 'Not Set',
//         OPENAI_API_KEY: OPENAI_API_KEY ? 'Set' : 'Not Set'
//       });

//       const openaiRequestBody = {
//         model: 'gpt-4o', // Updated to gpt-4o, though quota may still limit it
//         messages: sessionHistory,
//         max_tokens: 150,
//       };

//       const geminiRequestBody = {
//         contents: sessionHistory.map(msg => ({
//           parts: [{ text: msg.content }],
//           role: msg.role === 'user' ? 'user' : (msg.role === 'system' ? 'system' : 'model')
//         })),
//         generationConfig: {
//           maxOutputTokens: 150,
//           temperature: 0.7,
//         },
//       };

//       let openaiResponse, geminiResponse;

//       // Use mock OpenAI if API key is invalid or quota exceeded
//       if (!OPENAI_API_KEY || OPENAI_API_KEY.includes('sk-proj')) { // Simple check for mock trigger
//         openaiResponse = { data: await mockOpenAI.createChatCompletion(openaiRequestBody) };
//       } else {
//         openaiResponse = await axios.post(
//           OPENAI_API_URL,
//           openaiRequestBody,
//           {
//             headers: {
//               'Authorization': `Bearer ${OPENAI_API_KEY}`,
//               'Content-Type': 'application/json',
//             },
//           }
//         ).catch(error => {
//           console.error('OpenAI API Error:', error.response ? error.response.data : error.message);
//           return { data: { choices: [{ message: { content: '' } }] } };
//         });
//       }

//       geminiResponse = await axios.post(
//         GEMINI_API_URL,
//         geminiRequestBody,
//         {
//           headers: {
//             'Content-Type': 'application/json',
//           },
//         }
//       ).catch(error => {
//         console.error('Gemini API Error:', error.response ? error.response.data : error.message);
//         return { data: { candidates: [{ content: { parts: [{ text: '' }] } }] } };
//       });

//       ({ text: botReply, source } = getBestResponse(openaiResponse.data, geminiResponse.data));
//     }

//     console.log(`Selected ${source} response as the best`);

//     const botMessage = { role: 'assistant', content: botReply, timestamp: Date.now(), source };
//     await addDoc(sessionRef, botMessage);

//     res.json({ reply: botReply, source });
//   } catch (error) {
//     console.error('General Error:', error.message);
//     res.status(500).json({ error: 'Something went wrong' });
//   }
// });

// app.get('/api/chat/history/:sessionId', async (req, res) => {
//   const { sessionId } = req.params;
//   const sessionRef = collection(db, `sessions/${sessionId}/messages`);
//   const q = query(sessionRef, orderBy('timestamp', 'asc'));
//   const sessionSnapshot = await getDocs(q);
//   const history = sessionSnapshot.docs.map(doc => doc.data());
//   res.json(history);
// });

// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const express = require('express');
const axios = require('axios');
const cors = require('cors');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, getDocs, query, orderBy, doc, getDoc } = require('firebase/firestore');

// Mock OpenAI client for testing without API key
class MockOpenAI {
  async createChatCompletion(data) {
    const { messages } = data;
    const userMessage = messages[messages.length - 1]?.content || '';
    if (userMessage.toLowerCase().includes('bedtime story')) {
      return {
        choices: [{ message: { content: "Once upon a time, a magical unicorn with a shimmering silver horn led a lost child back home under a starry sky." } }],
      };
    }
    return {
      choices: [{ message: { content: "Sorry, mock response not available for this query." } }],
    };
  }
}

const app = express();
app.use(cors());
app.use(express.json());

// Hardcoded configuration
const GOOGLE_API_KEY = 'AIzaSyDnlKhgsaMf836p3TAlLYt5UuM7VXFKHEM'; // Your Google API key
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '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'; // Fallback to env or hardcoded
const PORT = 5000;

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAjHOBdOMBRPTsUC5XA-Ti5Hdvsr3HsrG8",
  authDomain: "zithara-rudra.firebaseapp.com",
  projectId: "zithara-rudra",
  storageBucket: "zithara-rudra.firebasestorage.app",
  messagingSenderId: "990246342492",
  appId: "1:990246342492:web:a08d315f5502365a51fb99",
  measurementId: "G-FVLBQRQDMP"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
console.log('Firestore initialized:', db ? 'Success' : 'Failed');

if (!db) {
  console.error('Firebase Firestore initialization failed');
  process.exit(1);
}

// API endpoints
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta1/models/gemini-1.5-pro-001:generateContent?key=' + GOOGLE_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// Mock OpenAI instance
const mockOpenAI = new MockOpenAI();

// Mock Inventory Database
const mockInventory = {
  'prod1': {
    name: 'Product 1',
    stock: 10,
    price: 29.99,
    description: 'A high-quality widget.',
    response: 'Product 1 is in stock with 10 units available at $29.99 each.'
  },
  'prod2': {
    name: 'Product 2',
    stock: 0,
    price: 49.99,
    description: 'A premium gadget.',
    response: 'Product 2 is currently out of stock. Please check back later.'
  }
};

// Mock Orders Database
const mockOrders = {
  'order1': {
    orderId: 'order1',
    status: 'pending',
    productId: 'prod1',
    quantity: 2,
    price: 59.98,
    customerName: 'John Doe',
    response: 'Your order order1 is pending with 2 units of prod1 at $59.98, placed by John Doe.'
  },
  'order2': {
    orderId: 'order2',
    status: 'shipped',
    productId: 'prod2',
    quantity: 1,
    price: 49.99,
    customerName: 'Jane Smith',
    response: 'Your order order2 is shipped with 1 unit of prod2 at $49.99, placed by Jane Smith.'
  }
};

// Function to check if the question is inventory-related or order-related
function isInventoryOrOrderQuestion(message) {
  const inventoryKeywords = ['stock', 'availability', 'product', 'inventory'];
  const orderKeywords = ['order', 'status', 'track', 'shipping'];
  return (
    inventoryKeywords.some(keyword => message.toLowerCase().includes(keyword)) ||
    orderKeywords.some(keyword => message.toLowerCase().includes(keyword)) ||
    Object.keys(mockInventory).some(prodId => message.toLowerCase().includes(prodId) || message.toLowerCase().includes(mockInventory[prodId].name.toLowerCase())) ||
    Object.keys(mockOrders).some(orderId => message.toLowerCase().includes(orderId))
  );
}

// Function to get inventory response
function getInventoryResponse(message) {
  const prodId = Object.keys(mockInventory).find(id =>
    message.toLowerCase().includes(id) || message.toLowerCase().includes(mockInventory[id].name.toLowerCase())
  );
  return prodId ? mockInventory[prodId].response : 'Sorry, I couldn’t find information about that product.';
}

// Function to get order response
async function getOrderResponse(message) {
  const orderIdMatch = message.toLowerCase().match(/(?:order|track|status\s*of|check)?\s*(\w+)/i);
  const matchedOrderId = orderIdMatch ? orderIdMatch[1] : null;
  if (matchedOrderId && matchedOrderId.trim().length > 0) {
    const orderId = matchedOrderId.toLowerCase();
    const docId = orderId.startsWith('order') ? orderId : `order${orderId}`;
    const orderRef = doc(db, 'orders', docId);
    const orderSnap = await getDoc(orderRef);
    console.log(`Checking order for ID: ${docId}, Exists: ${orderSnap.exists()}`); // Debug log
    if (orderSnap.exists()) {
      const orderData = orderSnap.data();
      console.log('Order data from Firestore:', orderData); // Debug log
      const customerId = orderData.customerId;
      let customerName = 'Unknown Customer';
      if (customerId && customerId.trim().length > 0) {
        const customerRef = doc(db, 'customers', customerId);
        const customerSnap = await getDoc(customerRef);
        customerName = customerSnap.exists() ? customerSnap.data().name : 'Unknown Customer';
      } else {
        console.log('No valid customerId found in order data');
      }
      return `Your order ${orderData.orderId} is ${orderData.status.toLowerCase()} with ${orderData.quantity} unit${orderData.quantity > 1 ? 's' : ''} of ${orderData.productId} at $${orderData.price}, placed by ${customerName}.`;
    } else if (mockOrders[docId]) {
      return mockOrders[docId].response;
    }
  }
  return 'Sorry, I couldn’t find information about that order. Please ensure the order ID (e.g., \'track order1\') is correct and try again.';
}

// Function to determine the best API response (for non-inventory/order questions)
function getBestResponse(openaiResponse, geminiResponse) {
  const openaiText = openaiResponse?.choices?.[0]?.message?.content || '';
  const geminiText = geminiResponse?.candidates?.[0]?.content?.parts?.[0]?.text || '';

  console.log('OpenAI Response:', openaiText ? openaiText.substring(0, 50) : 'Empty');
  console.log('Gemini Response:', geminiText ? geminiText.substring(0, 50) : 'Empty');
  console.log('OpenAI Response Length:', openaiText.length);
  console.log('Gemini Response Length:', geminiText.length);

  if (openaiText.length > 0) return { text: openaiText, source: 'OpenAI' };
  if (geminiText.length > 0) return { text: geminiText, source: 'Gemini' };
  return { text: 'No valid response from either API', source: 'Fallback' };
}

app.post('/api/chat', async (req, res) => {
  const { message, sessionId } = req.body;

  const sessionRef = collection(db, `sessions/${sessionId}/messages`);
  const q = query(sessionRef, orderBy('timestamp', 'asc'));
  const sessionSnapshot = await getDocs(q);
  let sessionHistory = sessionSnapshot.docs.map(doc => doc.data());

  const userMessage = { role: 'user', content: message, timestamp: Date.now() };
  await addDoc(sessionRef, userMessage);
  sessionHistory.push(userMessage);

  try {
    let botReply, source;

    // Check if the question is inventory-related or order-related
    if (isInventoryOrOrderQuestion(message)) {
      if (message.toLowerCase().includes('order') || message.toLowerCase().includes('track') || message.toLowerCase().includes('status')) {
        botReply = await getOrderResponse(message);
        source = 'Orders Database';
        console.log(`Orders Response: ${botReply}`);
      } else {
        botReply = getInventoryResponse(message);
        source = 'Inventory Database';
        console.log(`Inventory Response: ${botReply}`);
      }
    } else {
      if (!GOOGLE_API_KEY || !OPENAI_API_KEY) {
        throw new Error('One or both API keys are missing');
      }

      console.log('Attempting API calls with keys:', {
        GOOGLE_API_KEY: GOOGLE_API_KEY ? 'Set' : 'Not Set',
        OPENAI_API_KEY: OPENAI_API_KEY ? 'Set' : 'Not Set'
      });

      const openaiRequestBody = {
        model: 'gpt-4o',
        messages: sessionHistory,
        max_tokens: 150,
      };

      const geminiRequestBody = {
        contents: sessionHistory.map(msg => ({
          parts: [{ text: msg.content }],
          role: msg.role === 'user' ? 'user' : (msg.role === 'system' ? 'system' : 'model')
        })),
        generationConfig: {
          maxOutputTokens: 150,
          temperature: 0.7,
        },
      };

      let openaiResponse, geminiResponse;

      if (!OPENAI_API_KEY || OPENAI_API_KEY.includes('sk-proj')) {
        openaiResponse = { data: await mockOpenAI.createChatCompletion(openaiRequestBody) };
      } else {
        openaiResponse = await axios.post(
          OPENAI_API_URL,
          openaiRequestBody,
          {
            headers: {
              'Authorization': `Bearer ${OPENAI_API_KEY}`,
              'Content-Type': 'application/json',
            },
          }
        ).catch(error => {
          console.error('OpenAI API Error:', error.response ? error.response.data : error.message);
          return { data: { choices: [{ message: { content: '' } }] } };
        });
      }

      geminiResponse = await axios.post(
        GEMINI_API_URL,
        geminiRequestBody,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      ).catch(error => {
        console.error('Gemini API Error:', error.response ? error.response.data : error.message);
        return { data: { candidates: [{ content: { parts: [{ text: '' }] } }] } };
      });

      ({ text: botReply, source } = getBestResponse(openaiResponse.data, geminiResponse.data));
    }

    console.log(`Selected ${source} response as the best`);

    const botMessage = { role: 'assistant', content: botReply, timestamp: Date.now(), source };
    await addDoc(sessionRef, botMessage);

    res.json({ reply: botReply, source });
  } catch (error) {
    console.error('General Error:', error.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

app.get('/api/chat/history/:sessionId', async (req, res) => {
  const { sessionId } = req.params;
  const sessionRef = collection(db, `sessions/${sessionId}/messages`);
  const q = query(sessionRef, orderBy('timestamp', 'asc'));
  const sessionSnapshot = await getDocs(q);
  const history = sessionSnapshot.docs.map(doc => doc.data());
  res.json(history);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));