/* Profile, live deploy URLs, ML knowledge stack, career data. */
const PROFILE = {
  name: 'Raj Shekhar',
  role: 'AI / ML Engineer',
  subtitle: 'B.Tech Mechanical Engineering · IIT Patna',
  tagline: 'I design and deploy intelligent systems — from classical ML pipelines to transformer-based agents in production.',
  email: 'shekharaj0007@gmail.com',
  phone: '+91-8920199042',
  github: 'shekharaj0007',
  leetcode: 'RAJ_SHEKHAR0007',
  linkedin: 'raj-shekhar',
  institute: 'Indian Institute of Technology, Patna',
  degree: 'Bachelor of Technology, Mechanical Engineering',
  duration: '2023 – 2027'
};

const LIVE_DEPLOYS = {
  'DigitalTwin.AI': 'https://digitaltwin-ai-rpnh.onrender.com/',
  'Interview-AI': 'https://interview-ai-7xfp.onrender.com/',
  'ControlPlane-.ai': 'https://controlplane-ai.onrender.com/',
  'TradeMindAI--Stock-Market-Analyst': 'https://trademindai-69jq.onrender.com/',
  'FINZEN---Personal-Finance-AI': 'https://finzen-bdl6.onrender.com/',
  'Vigil-PIDS': 'https://vigil-pids.onrender.com/',
  'SpecGround': 'https://specground.onrender.com/',
  'SCHOLAR': 'https://scholar-ai-research-assistant-1.onrender.com/',
  'AI-lecture-Co-Pilot': 'https://lecture-copilot-api.onrender.com/',
  'Ai-Data-Scientist': 'https://ai-data-scientist-vdxv.onrender.com/',
  'Presence': 'https://presence-o4oo.onrender.com/',
  'AI-Investment-Platform': 'https://ai-investment-01dp.onrender.com/',
  'GatiSetu': 'https://gatisetu.onrender.com/',
  'Lattice-Circularity-Analyzer': 'https://lattice-circularity-analyzer.onrender.com/',
  'MetalDefectAI': 'https://metaldefectai.onrender.com/',
  'Assesment-Advisory-ChatBot': 'https://shl-assesment-advisory-chatbot.onrender.com/',
  'AetherShield-VMS-Platform': 'https://aethershield-ui.onrender.com/',
  'PathWise': 'https://pathwise-r3a3.onrender.com/',
  'ProductForge': 'https://productforge.onrender.com/'
};

function liveUrl(repo) {
  if (!repo) return null;
  const hp = (repo.homepage || '').trim();
  if (hp) return hp.startsWith('http') ? hp : 'https://' + hp;
  return LIVE_DEPLOYS[repo.name] || null;
}

/* Rich project metadata for flashcard backs — sourced from résumé + repos. */
const PROJECT_META = {
  'GatiSetu': {
    summary: 'AI mobility intelligence platform for transportation-mode classification and traffic-aware ETA prediction from GPS trajectories.',
    stack: ['Python', 'Random Forest', 'scikit-learn', 'FastAPI', 'Geospatial ML', 'Google Maps API', 'OSRM', 'Render']
  },
  'Presence': {
    summary: 'Camera-free occupancy intelligence using WiFi multipath RSSI — estimates room, people count, and nearby objects without cameras.',
    stack: ['Python', 'Random Forest', 'HistGradientBoosting', 'Kalman Filter', 'Signal Processing', 'Multi-task ML', 'FastAPI']
  },
  'AetherShield-VMS-Platform': {
    summary: 'AI video-management platform with real-time YOLO detection, ByteTrack tracking, face identity matching, and zone-intrusion monitoring.',
    stack: ['YOLOv11', 'ByteTrack', 'OpenCV', 'Haar Cascade', 'Computer Vision', 'FastAPI', 'React', 'NL Video Search']
  },
  'ProductForge': {
    summary: 'AI product-management platform converting startup ideas into market analysis, PRDs, user stories, and prioritized roadmaps.',
    stack: ['Claude Sonnet 4', 'GPT-4o', 'Generative AI', 'Structured Outputs', 'RICE Scoring', 'MoSCoW', 'FastAPI', 'React']
  },
  'SCHOLAR': {
    summary: 'AI research assistant for querying academic papers, evidence retrieval, gap analysis, and literature synthesis via RAG.',
    stack: ['RAG', 'BGE Embeddings', 'FAISS', 'Vector Search', 'LangChain', 'FastAPI', '384-dim Embeddings', 'Chunking']
  },
  'PathWise': {
    summary: 'AI career intelligence platform for resume screening, JD matching, ATS optimization, and structured interview feedback.',
    stack: ['Gemini', 'OpenAI', 'Anthropic', 'ATS Scoring', 'O*NET Skills', 'FastAPI', 'React', 'NLP']
  },
  'DigitalTwin.AI': {
    summary: 'Digital twin platform simulating and monitoring physical systems with AI-driven analytics and real-time dashboards.',
    stack: ['Python', 'FastAPI', 'React', 'IoT Simulation', 'Real-time Data', 'Docker', 'Render']
  },
  'Interview-AI': {
    summary: 'AI-powered mock interview coach with technical signal scoring, STAR structure analysis, and communication feedback.',
    stack: ['LLMs', 'Speech Analysis', 'FastAPI', 'React', 'Prompt Engineering', 'Structured Outputs']
  },
  'ControlPlane-.ai': {
    summary: 'Multi-agent control plane for orchestrating AI workflows, tool use, and autonomous task execution.',
    stack: ['LangChain', 'LangGraph', 'FastAPI', 'Agentic AI', 'Function Calling', 'Docker']
  },
  'TradeMindAI--Stock-Market-Analyst': {
    summary: 'AI stock market analyst combining financial data, sentiment signals, and LLM reasoning for market insights.',
    stack: ['Python', 'LLMs', 'Financial APIs', 'Time Series', 'FastAPI', 'React', 'RAG']
  },
  'FINZEN---Personal-Finance-AI': {
    summary: 'Personal finance AI assistant for budgeting, expense tracking, and intelligent financial recommendations.',
    stack: ['Python', 'LLMs', 'FastAPI', 'React', 'PostgreSQL', 'REST APIs', 'Razorpay']
  },
  'Vigil-PIDS': {
    summary: 'Perimeter intrusion detection system using computer vision for real-time threat monitoring and alerts.',
    stack: ['YOLO', 'OpenCV', 'Computer Vision', 'Object Detection', 'FastAPI', 'Real-time Streaming']
  },
  'SpecGround': {
    summary: 'Specification-grounded AI system for validating requirements, generating test cases, and structured documentation.',
    stack: ['LLMs', 'RAG', 'Structured Outputs', 'FastAPI', 'React', 'Prompt Engineering']
  },
  'AI-lecture-Co-Pilot': {
    summary: 'Lecture co-pilot that transcribes, summarizes, and generates study materials from live or recorded lectures.',
    stack: ['Whisper', 'LLMs', 'RAG', 'FastAPI', 'Embeddings', 'Summarization']
  },
  'Ai-Data-Scientist': {
    summary: 'Autonomous data-science agent that explores datasets, trains models, and produces analysis reports.',
    stack: ['Python', 'scikit-learn', 'pandas', 'LLMs', 'AutoML', 'FastAPI', 'Agentic AI']
  },
  'AI-Investment-Platform': {
    summary: 'AI-driven investment research platform with portfolio analysis, risk scoring, and market intelligence.',
    stack: ['Python', 'LLMs', 'Financial ML', 'FastAPI', 'React', 'REST APIs', 'Recharts']
  },
  'Lattice-Circularity-Analyzer': {
    summary: 'Engineering tool for analyzing lattice structures and circularity metrics in mechanical design workflows.',
    stack: ['Python', 'NumPy', 'Computer Vision', 'FastAPI', 'Engineering Analytics']
  },
  'MetalDefectAI': {
    summary: 'Industrial defect detection pipeline using deep learning for automated quality inspection on metal surfaces.',
    stack: ['PyTorch', 'CNN', 'YOLO', 'OpenCV', 'Computer Vision', 'FastAPI', 'Transfer Learning']
  },
  'Assesment-Advisory-ChatBot': {
    summary: 'Conversational advisory chatbot for assessment guidance with retrieval-augmented responses.',
    stack: ['RAG', 'LangChain', 'FastAPI', 'Embeddings', 'Vector Search', 'React']
  },
  'My-Portfolio': {
    summary: 'Live portfolio with GitHub sync, LeetCode stats, ML knowledge stack, and fullscreen project previews.',
    stack: ['HTML', 'CSS', 'JavaScript', 'GitHub API', 'LeetCode API']
  }
};

function projectMeta(repo) {
  const m = PROJECT_META[repo.name];
  if (m) return m;
  return {
    summary: repo.description || 'Production AI system deployed on Render with full-stack ML pipeline.',
    stack: [repo.language, 'FastAPI', 'Python', 'Docker', 'Render'].filter(Boolean)
  };
}

/* Comprehensive ML knowledge stack — foundations through agentic AI. */
const ML_STACK = [
  {
    step: '01',
    title: 'Mathematical Foundations',
    summary: 'Linear algebra, probability, and optimization — the language every model is written in.',
    color: '#6366f1',
    detail: 'Before touching frameworks, you need fluency in vectors, gradients, and statistical inference. This layer covers the math that makes loss functions, backpropagation, and uncertainty quantification possible.',
    groups: [
      { label: 'Linear Algebra', items: ['Vectors & Matrices', 'Eigenvalues / SVD', 'Matrix Calculus', 'Dot Products & Projections'] },
      { label: 'Calculus & Optimization', items: ['Partial Derivatives', 'Chain Rule', 'Gradient Descent', 'Convex vs Non-convex Landscapes', 'Learning Rate Schedules'] },
      { label: 'Probability & Statistics', items: ['Bayes\' Theorem', 'Distributions (Gaussian, Bernoulli)', 'MLE / MAP Estimation', 'Bias–Variance Tradeoff', 'Confidence Intervals'] }
    ]
  },
  {
    step: '02',
    title: 'Data Engineering & Preprocessing',
    summary: 'Turning raw signals into clean, model-ready tensors and feature matrices.',
    color: '#7c3aed',
    detail: 'Real-world ML is 80% data work. This covers ingestion, cleaning, feature construction, and the pipelines that keep training and inference consistent in production.',
    groups: [
      { label: 'Data Wrangling', items: ['pandas / NumPy', 'Missing Value Imputation', 'Outlier Detection', 'Train/Val/Test Splits', 'Data Leakage Prevention'] },
      { label: 'Feature Engineering', items: ['Encoding (One-hot, Target)', 'Scaling & Normalization', 'Polynomial Features', 'Domain-specific Features', 'Feature Selection (RFE, MI)'] },
      { label: 'Evaluation Metrics', items: ['Accuracy / F1 / AUC-ROC', 'Precision–Recall Curves', 'RMSE / MAE / R²', 'Confusion Matrices', 'Calibration & Threshold Tuning'] }
    ]
  },
  {
    step: '03',
    title: 'Classical Machine Learning',
    summary: 'Supervised, unsupervised, and ensemble methods — still the backbone of tabular and structured data.',
    color: '#8b5cf6',
    detail: 'Tree ensembles and linear models remain state-of-the-art on many real datasets. Mastery here means knowing when a Random Forest beats a neural net — and how to interpret results with SHAP.',
    groups: [
      { label: 'Supervised Learning', items: ['Linear & Logistic Regression', 'Support Vector Machines', 'Naive Bayes', 'k-NN', 'Regularization (L1/L2)'] },
      { label: 'Ensemble Methods', items: ['Decision Trees', 'Random Forest', 'Gradient Boosting', 'XGBoost', 'LightGBM', 'HistGradientBoosting'] },
      { label: 'Unsupervised', items: ['K-Means / DBSCAN', 'Hierarchical Clustering', 'PCA', 't-SNE / UMAP', 'Anomaly Detection'] },
      { label: 'Model Selection', items: ['Cross-Validation (k-fold, stratified)', 'Grid / Random Search', 'Bayesian Optimization', 'scikit-learn Pipelines', 'SHAP Explainability'] }
    ]
  },
  {
    step: '04',
    title: 'Deep Learning Fundamentals',
    summary: 'Neural networks, backpropagation, and the training dynamics that make deep models work.',
    color: '#a855f7',
    detail: 'From perceptrons to deep MLPs — understanding activations, optimizers, and regularization is essential before specializing in vision or language architectures.',
    groups: [
      { label: 'Core Concepts', items: ['Forward / Backpropagation', 'Activation Functions (ReLU, GELU, Softmax)', 'Loss Functions (CE, MSE, Focal)', 'Weight Initialization'] },
      { label: 'Training Dynamics', items: ['SGD, Adam, AdamW', 'Batch Normalization', 'Dropout & Early Stopping', 'Learning Rate Warmup', 'Mixed Precision Training'] },
      { label: 'Frameworks', items: ['PyTorch (nn.Module, DataLoader)', 'TensorFlow / Keras', 'ONNX Export', 'GPU / CUDA Basics', 'Model Checkpointing'] }
    ]
  },
  {
    step: '05',
    title: 'Computer Vision',
    summary: 'CNNs, object detection, tracking, and real-time visual intelligence pipelines.',
    color: '#9333ea',
    detail: 'Vision systems power everything from defect inspection to surveillance. This layer spans convolutional architectures through modern single-stage detectors and multi-object trackers.',
    groups: [
      { label: 'Architectures', items: ['CNNs (ResNet, EfficientNet)', 'Transfer Learning', 'Data Augmentation', 'Vision Transformers (ViT)', 'Self-supervised Vision'] },
      { label: 'Detection & Tracking', items: ['YOLO (v8–v11)', 'Object Detection Metrics (mAP)', 'ByteTrack / SORT', 'ROI / Zone Monitoring', 'MediaPipe / OpenCV'] },
      { label: 'Applications', items: ['Face Recognition & Embeddings', 'Haar Cascades', 'Semantic Segmentation', 'Multi-Object Tracking', 'Real-time Inference Optimization'] }
    ]
  },
  {
    step: '06',
    title: 'Sequence Models & Early NLP',
    summary: 'RNNs, LSTMs, and the path to attention — modeling temporal and sequential data.',
    color: '#c026d3',
    detail: 'Before transformers dominated NLP, sequence models handled time series, speech, and text. Understanding their limitations motivates the attention revolution.',
    groups: [
      { label: 'Sequence Architectures', items: ['RNN / LSTM / GRU', 'Bidirectional Models', 'Sequence-to-Sequence', 'Teacher Forcing', 'Vanishing Gradient Problem'] },
      { label: 'NLP Foundations', items: ['Tokenization (BPE, WordPiece)', 'Word Embeddings (Word2Vec, GloVe)', 'Named Entity Recognition', 'Text Classification', 'Sentiment Analysis'] },
      { label: 'Time Series', items: ['ARIMA / Prophet', 'Sequence Forecasting', 'Kalman Filtering', 'Feature Extraction from Signals', 'Anomaly Detection in Streams'] }
    ]
  },
  {
    step: '07',
    title: 'Transformers & Attention',
    summary: 'Self-attention, encoder–decoder stacks, and the architecture behind modern AI.',
    color: '#d946ef',
    detail: 'Transformers replaced recurrence with parallelizable attention. BERT, GPT, and ViT all share this core — scaled up with more data, parameters, and compute.',
    groups: [
      { label: 'Attention Mechanisms', items: ['Scaled Dot-Product Attention', 'Multi-Head Attention', 'Positional Encoding (sinusoidal, RoPE)', 'Cross-Attention', 'Flash Attention'] },
      { label: 'Architectures', items: ['Transformer Encoder–Decoder', 'BERT (Masked LM)', 'GPT (Autoregressive)', 'T5 / BART', 'Vision Transformers (ViT)'] },
      { label: 'Fine-tuning', items: ['Hugging Face Transformers', 'Full Fine-tuning vs Adapters', 'Instruction Tuning', 'RLHF Overview', 'Evaluation (BLEU, ROUGE, perplexity)'] }
    ]
  },
  {
    step: '08',
    title: 'RAG & Retrieval Systems',
    summary: 'Grounding LLMs in real knowledge via embeddings, vector search, and hybrid retrieval.',
    color: '#ec4899',
    detail: 'RAG closes the gap between parametric model knowledge and your private documents. Production RAG requires careful chunking, embedding choice, reranking, and hallucination control.',
    groups: [
      { label: 'Embeddings', items: ['Text Embeddings (BGE, OpenAI, Cohere)', '384 / 768 / 1536-dim Vectors', 'Cosine Similarity', 'Embedding Fine-tuning', 'Multimodal Embeddings'] },
      { label: 'Vector Infrastructure', items: ['FAISS', 'pgvector', 'Pinecone / Weaviate', 'Vector Databases', 'Hybrid Search (Dense + BM25)'] },
      { label: 'RAG Pipeline', items: ['Document Chunking (fixed, semantic)', 'Top-k Retrieval & Reranking', 'Context Window Management', 'Citation & Grounding', 'RAG Evaluation (faithfulness, recall)'] }
    ]
  },
  {
    step: '09',
    title: 'Generative AI & LLMs',
    summary: 'Foundation models, prompt engineering, fine-tuning, and multimodal generation.',
    color: '#f43f5e',
    detail: 'Generative AI spans text, code, images, and structured outputs. Production use requires prompt design, efficient fine-tuning, guardrails, and cost-aware inference.',
    groups: [
      { label: 'LLM Fundamentals', items: ['GPT / Claude / Gemini APIs', 'Context Windows & Token Limits', 'Temperature & Sampling', 'Structured Outputs (JSON mode)', 'Chain-of-Thought Prompting'] },
      { label: 'Fine-tuning & Efficiency', items: ['LoRA / QLoRA', 'PEFT Methods', 'Distillation', 'Quantization (INT8, GPTQ)', 'vLLM / Inference Optimization'] },
      { label: 'Multimodal & Safety', items: ['Vision-Language Models', 'Diffusion Models (Stable Diffusion)', 'Image Generation Pipelines', 'Guardrails & Content Filtering', 'Red-teaming & Alignment'] }
    ]
  },
  {
    step: '10',
    title: 'Agentic AI & Production ML',
    summary: 'Autonomous agents, MLOps, and shipping intelligent systems to production.',
    color: '#f97316',
    detail: 'The frontier is agents that plan, call tools, and collaborate. Production ML adds Docker, monitoring, CI/CD, and observability so models survive real traffic.',
    groups: [
      { label: 'Agent Architectures', items: ['ReAct Pattern', 'LangChain & LangGraph', 'Tool Use / Function Calling', 'Multi-Agent Orchestration', 'Planning & Task Decomposition'] },
      { label: 'Agent Memory & State', items: ['Short-term Context', 'Long-term Vector Memory', 'Conversation History', 'State Machines', 'Human-in-the-Loop'] },
      { label: 'MLOps & Deployment', items: ['Docker & Containerization', 'FastAPI / REST APIs', 'MLflow Experiment Tracking', 'GitHub Actions CI/CD', 'Render / Cloud Deploy', 'Monitoring & Observability'] }
    ]
  }
];

const SKILLS = [
  {
    group: 'Programming Languages',
    items: ['Python', 'C++', 'TypeScript', 'JavaScript', 'SQL', 'HTML', 'CSS']
  },
  {
    group: 'Web & Backend',
    items: ['React', 'Next.js', 'FastAPI', 'Flask', 'Streamlit', 'SQLAlchemy', 'REST APIs', 'WebSockets', 'JWT']
  },
  {
    group: 'Machine Learning',
    items: ['Supervised Learning', 'Classification', 'Regression', 'Feature Engineering', 'Cross-Validation', 'scikit-learn', 'XGBoost', 'LightGBM', 'SHAP', 'pandas', 'NumPy']
  },
  {
    group: 'Deep Learning & CV',
    items: ['PyTorch', 'CNN', 'RNN / LSTM', 'Transformers', 'YOLOv11', 'Object Detection', 'Multi-Object Tracking', 'OpenCV', 'Transfer Learning']
  },
  {
    group: 'LLMs, NLP & RAG',
    items: ['Generative AI', 'LLMs', 'RAG', 'Embeddings', 'Semantic Search', 'Vector Search', 'FAISS', 'Cosine Similarity', 'Structured Outputs', 'Prompt Engineering']
  },
  {
    group: 'Agents & Orchestration',
    items: ['LangChain', 'LangGraph', 'Agentic AI', 'Function Calling', 'Multi-Agent Systems', 'Tool Use']
  },
  {
    group: 'Databases & Cloud',
    items: ['PostgreSQL', 'SQLite', 'Redis', 'pgvector', 'Vector Databases', 'Docker', 'Render']
  },
  {
    group: 'Tools & Engineering',
    items: ['Git', 'GitHub Actions', 'MLflow', 'pytest', 'PyMuPDF', 'Recharts', 'Zustand', 'Razorpay', 'Tailwind CSS']
  }
];

const EDUCATION = [
  { level: 'B.Tech, Mechanical Engineering', place: 'Indian Institute of Technology, Patna', year: '2023 – 2027', score: 'IIT Patna' },
  { level: 'Senior Secondary (XII)', place: 'Modern Delhi Public School, Faridabad', year: '2022', score: '94.80%' },
  { level: 'Matriculation (X)', place: 'Modern Delhi Public School, Faridabad', year: '2020', score: '91.20%' }
];

const ACHIEVEMENTS = [
  { title: 'JEE Main 2023', detail: '99.93 percentile — top 12,000 nationally' },
  { title: 'JEE Advanced 2023', detail: 'All India Rank ~9,000' },
  { title: 'SOF International Mathematics Olympiad', detail: 'Haryana State Gold — 2019, 2020, 2022' }
];

const POSITIONS = [
  { role: 'AI Intern', org: 'GatiSetu / Street Surge Technology', period: 'May – Jul 2025' },
  { role: 'Core Member', org: 'Team Phoenix, Robotics Club, IIT Patna', period: 'Aug 2023 – Present' },
  { role: 'Member', org: 'Robotics & Aviation Club, IIT Patna', period: 'Jun 2024 – Present' },
  { role: 'Sub Coordinator', org: 'Students Club of Mechanical Engineering, IIT Patna', period: 'Jun 2024 – Present' }
];

const JOURNEY = [
  { year: '2019', title: 'Olympiad Gold', body: 'Haryana State Gold in SOF IMO — competitive problem-solving begins.' },
  { year: '2023', title: 'IIT Patna', body: 'JEE Main 99.93% · Advanced ~9k AIR. B.Tech Mechanical Engineering.' },
  { year: '2023', title: 'Robotics Core', body: 'Team Phoenix, IIT Patna — hardware systems and control.' },
  { year: '2024', title: 'First Deployments', body: 'Public GitHub repos. Python, CV, and full-stack in production.' },
  { year: '2025', title: 'Deep Learning', body: 'Computer vision pipelines, NLP systems, production ML.' },
  { year: '2026', title: 'AI Platforms', body: 'Digital twins, RAG assistants, multi-agent systems — all live.' }
];

const RESUME_HIGHLIGHTS = [
  { label: 'Live Deployments', value: '18+' },
  { label: 'ML Accuracy (GatiSetu)', value: '90.9%' },
  { label: 'Research Papers Indexed', value: '1,200+ chunks' },
  { label: 'LeetCode Problems', value: '480+' }
];
