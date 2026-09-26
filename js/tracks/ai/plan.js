/**
 * The AI plan: 240 missions in eight parts, from the maths underneath to the
 * frontier, each day built on the ones before it.
 *
 * Every part has the same rhythm:
 *   days 1–6, 8–13, 15–20   learn, prove it, and build — three builds a part
 *   days 7, 14, 21, 28      frontier days: something that dropped this week,
 *                           learned with AI, tried by hand, logged on GitHub
 *   days 22–27, 29          reproduce a well-known paper — the part's capstone
 *   day 30                  the boss, once the reproduction is verified
 *
 * Builds are checked on GitHub (tests passing on GitHub Actions, the numbers
 * in the README, commits by you) or on Hugging Face (a public model or demo
 * under your account, with a card that reports how well it does). Every build
 * says what it costs to run: free on Colab or Kaggle, or cheap on a rented GPU.
 */
import { numberDays } from '../../learn/plan.js';

/** How many questions a mission's check may use, by part. */
export const checkBudget = part => Math.min(20, 8 + part);

/** Paces for a 240-mission plan: the fastest is one mission a day. */
export const PACES = [
  { months: 8,  hours: 3,   label: 'about 3 hours a day' },
  { months: 12, hours: 2,   label: 'about 2 hours a day' },
  { months: 16, hours: 1.5, label: 'about 1½ hours a day' },
  { months: 24, hours: 1,   label: 'about an hour a day' },
];

export const MONTHS = [
  { n:1, title:'The maths underneath', short:'Maths', level:'Foundations', icon:'📐', color:'var(--yellow)',
    goal:'Linear algebra, calculus, probability and optimisation — fluent enough to read any paper.' },
  { n:2, title:'Machine learning without deep learning', short:'Classic ML', level:'Foundations', icon:'🌳', color:'var(--acid)',
    goal:'Models that still win on tables, recommendations and forecasts — and evaluating them honestly.' },
  { n:3, title:'Deep learning from scratch', short:'Deep', level:'Intermediate', icon:'🧬', color:'var(--cyan)',
    goal:'Backprop you wrote yourself, training that works, and knowing where the GPU time goes.' },
  { n:4, title:'Language models from scratch', short:'LLMs', level:'Intermediate', icon:'💬', color:'var(--blue)',
    goal:'Tokenizer, attention, a GPT and a pretrained model of your own — and how it all scales.' },
  { n:5, title:'Making models smart', short:'Post-training', level:'Advanced', icon:'🎯', color:'var(--violet)',
    goal:'Fine-tuning, RL, preference tuning and reasoning — how assistants are actually made.' },
  { n:6, title:'Building with AI', short:'Engineering', level:'Advanced', icon:'🛠️', color:'var(--orange)',
    goal:'Retrieval, agents, tools, evals and serving — AI that works for real, measured.' },
  { n:7, title:'Beyond text', short:'Multimodal', level:'Advanced', icon:'🎨', color:'var(--pink)',
    goal:'Vision, image generation, speech and robot learning.' },
  { n:8, title:'The frontier, and keeping it safe', short:'Frontier', level:'Expert', icon:'🔭', color:'var(--red)',
    goal:'Look inside models, attack them and defend them, and do research of your own.' },
];
export const monthByN = n => MONTHS.find(m => m.n === n);

/** One boss a part, fought once that part's paper reproduction is verified. */
export const BOSSES = [
  { month:1, name:'The Exploding Gradient', icon:'💥', intro:'Step size 10. What could go wrong?', half:'You clipped something.', won:'Converged.', lost:'NaN. Lower the learning rate and come back tomorrow.' },
  { month:2, name:'The Leaky Split', icon:'🚰', intro:'99% accuracy. Don\'t ask how.', half:'You found the leak.', won:'An honest validation score.', lost:'Your test set saw everything. Tomorrow.' },
  { month:3, name:'The Vanishing Gradient', icon:'🫥', intro:'Fifty layers deep and nothing moves.', half:'A residual connection appeared.', won:'Gradients flow.', lost:'Stuck at the start. Tomorrow.' },
  { month:4, name:'The Loss Spike', icon:'📈', intro:'Step 40,000. Everything was fine.', half:'You found the bad batch.', won:'Smooth to the end.', lost:'Diverged. Roll back and come back tomorrow.' },
  { month:5, name:'The Reward Hacker', icon:'🎰', intro:'The reward went up. The answers got worse.', half:'You checked the samples.', won:'Aligned with what you meant.', lost:'It gamed you. Tomorrow.' },
  { month:6, name:'The Hallucination', icon:'👻', intro:'Confident, fluent, and wrong.', half:'Retrieval found the source.', won:'Grounded.', lost:'Made it up again. Tomorrow.' },
  { month:7, name:'The Mode Collapse', icon:'🌀', intro:'Every sample, the same face.', half:'Diversity is creeping back.', won:'The whole distribution.', lost:'One mode to rule them all. Tomorrow.' },
  { month:8, name:'The Black Box', icon:'⬛', intro:'You will never know why I said that.', half:'A feature lit up.', won:'Opened.', lost:'Still opaque. Tomorrow.' },
].map(b => ({ ...b, id: `ai-${b.month}` }));
export const bossFor = n => BOSSES.find(b => b.month === n);

/* --------------------------------- topics --------------------------------- */

const r = (name, url, note = '', price = 'free') => ({ name, url, note, price });
const ax = (id, name) => r(`Paper: ${name}`, `https://arxiv.org/abs/${id}`, `arXiv ${id}`);

export const TOPICS = [
  /* part 1 */
  { id:'p1-linalg', month:1, name:'Linear algebra', why:'Every model is matrices multiplying vectors; fluency here makes every later paper readable.',
    resources:[r('3Blue1Brown: Essence of linear algebra', 'https://www.3blue1brown.com/topics/linear-algebra', 'The intuition, beautifully drawn'),
      r('MIT 18.06: Linear Algebra', 'https://ocw.mit.edu/courses/18-06sc-linear-algebra-fall-2011/', 'The full course, with problem sets'),
      r('Mathematics for Machine Learning (book)', 'https://mml-book.github.io/', 'Free PDF, written for exactly this')] },
  { id:'p1-calc', month:1, name:'Calculus and gradients', why:'Training is walking downhill on a gradient; the chain rule is backpropagation.',
    resources:[r('3Blue1Brown: Essence of calculus', 'https://www.3blue1brown.com/topics/calculus'),
      r('Khan Academy: Multivariable calculus', 'https://www.khanacademy.org/math/multivariable-calculus', 'Gradients and partial derivatives'),
      r('Mathematics for Machine Learning (book)', 'https://mml-book.github.io/', 'Chapter 5: vector calculus')] },
  { id:'p1-prob', month:1, name:'Probability and statistics', why:'Models output probabilities, losses are log-likelihoods, and every result needs error bars.',
    resources:[r('Seeing Theory', 'https://seeing-theory.brown.edu/', 'Probability you can see'),
      r('StatQuest', 'https://www.youtube.com/@statquest', 'Clear short videos on every statistics idea'),
      r('Mathematics for Machine Learning (book)', 'https://mml-book.github.io/', 'Chapter 6: probability')] },
  { id:'p1-opt', month:1, name:'Optimisation and information theory', why:'Gradient descent and its variants, and the cross-entropy loss every language model minimises.',
    resources:[r('Visual Information Theory (colah)', 'https://colah.github.io/posts/2015-09-Visual-Information/', 'Entropy and KL, drawn'),
      r('Convex Optimization (Boyd)', 'https://web.stanford.edu/~boyd/cvxbook/', 'Free book; read the early chapters'),
      ax('1412.6980', 'Adam: A Method for Stochastic Optimization')] },
  { id:'p1-tools', month:1, name:'Tested, reproducible code', why:'Every build here is code with tests that run on every push. Set the habit now.',
    resources:[r('pytest', 'https://docs.pytest.org/'),
      r('GitHub Actions: testing Python', 'https://docs.github.com/en/actions/automating-builds-and-tests/building-and-testing-python', 'Run your tests on every push'),
      r('Google Colab', 'https://colab.research.google.com/', 'A free notebook with a GPU')] },
  /* part 2 */
  { id:'p2-workflow', month:2, name:'The ML workflow', why:'Splits, leakage, metrics and baselines decide whether a result is real.',
    resources:[r('Google Machine Learning Crash Course', 'https://developers.google.com/machine-learning/crash-course'),
      r('scikit-learn user guide', 'https://scikit-learn.org/stable/user_guide.html'),
      r('An Introduction to Statistical Learning', 'https://www.statlearning.com/', 'Free book, with Python labs')] },
  { id:'p2-models', month:2, name:'Linear models, trees and boosting', why:'Still the best tools for tabular data, and the right baseline for almost anything.',
    resources:[r('An Introduction to Statistical Learning', 'https://www.statlearning.com/'),
      r('Stanford CS229', 'https://cs229.stanford.edu/', 'Lecture notes with the maths'),
      r('XGBoost documentation', 'https://xgboost.readthedocs.io/'),
      ax('2207.08815', 'Why do tree-based models still outperform deep learning on tabular data?')] },
  { id:'p2-unsup', month:2, name:'Clustering and dimensionality reduction', why:'Finding structure without labels — and the ways it fools you.',
    resources:[r('scikit-learn user guide', 'https://scikit-learn.org/stable/user_guide.html', 'Clustering and decomposition chapters'),
      r('StatQuest', 'https://www.youtube.com/@statquest', 'k-means, PCA, t-SNE and UMAP')] },
  { id:'p2-recsys', month:2, name:'Recommender systems', why:'What most of the internet runs on: collaborative filtering and ranking.',
    resources:[r('Google: Recommendation systems course', 'https://developers.google.com/machine-learning/recommendation'),
      r('MovieLens datasets', 'https://grouplens.org/datasets/movielens/', 'The classic benchmark')] },
  { id:'p2-time', month:2, name:'Forecasting', why:'Demand, traffic, prices: the problems where the naive baseline is embarrassingly hard to beat.',
    resources:[r('Forecasting: Principles and Practice', 'https://otexts.com/fpp3/', 'Free book by Hyndman & Athanasopoulos'),
      r('Kaggle Learn', 'https://www.kaggle.com/learn', 'Short practical courses, including time series')] },
  /* part 3 */
  { id:'p3-nets', month:3, name:'Neural networks and backprop', why:'Build the machinery yourself once and nothing in deep learning is magic again.',
    resources:[r('Karpathy: Neural Networks — Zero to Hero', 'https://karpathy.ai/zero-to-hero.html', 'Start with micrograd'),
      r('micrograd', 'https://github.com/karpathy/micrograd'),
      r('3Blue1Brown: Neural networks', 'https://www.3blue1brown.com/topics/neural-networks'),
      r('Understanding Deep Learning (book)', 'https://udlbook.github.io/udlbook/', 'Free, modern and clear')] },
  { id:'p3-train', month:3, name:'Training deep networks', why:'Initialisation, normalisation, optimisers and regularisation are what make depth trainable.',
    resources:[r('Dive into Deep Learning', 'https://d2l.ai/', 'Free, with runnable code'),
      r('Understanding Deep Learning (book)', 'https://udlbook.github.io/udlbook/'),
      r('Deep Learning (Goodfellow et al.)', 'https://www.deeplearningbook.org/'),
      r('fast.ai: Practical Deep Learning', 'https://course.fast.ai/')] },
  { id:'p3-cnn', month:3, name:'Convolutional networks', why:'Where deep learning first beat everything, and where residual connections were born.',
    resources:[r('Stanford CS231n notes', 'https://cs231n.github.io/'),
      r('Dive into Deep Learning', 'https://d2l.ai/', 'The CNN and modern-CNN chapters'),
      ax('1512.03385', 'Deep Residual Learning for Image Recognition')] },
  { id:'p3-torch', month:3, name:'PyTorch', why:'The tool nearly every model on this plan is written in.',
    resources:[r('PyTorch tutorials', 'https://pytorch.org/tutorials/'),
      r('fast.ai: Practical Deep Learning', 'https://course.fast.ai/')] },
  { id:'p3-gpu', month:3, name:'GPUs and speed', why:'Knowing where time and memory go is the difference between a run that fits and one that does not.',
    resources:[r('Making Deep Learning Go Brrrr (Horace He)', 'https://horace.io/brrr_intro.html', 'Compute, memory and overhead'),
      r('PyTorch automatic mixed precision', 'https://docs.pytorch.org/docs/stable/notes/amp_examples.html'),
      r('Triton tutorials', 'https://triton-lang.org/main/getting-started/tutorials/index.html', 'Write GPU kernels in Python')] },
  /* part 4 */
  { id:'p4-lm', month:4, name:'Language modelling and tokens', why:'Next-token prediction and tokenization explain most of what LLMs do — and their quirks.',
    resources:[r('Karpathy: Neural Networks — Zero to Hero', 'https://karpathy.ai/zero-to-hero.html', 'makemore, the tokenizer lecture, Let\'s build GPT'),
      r('minbpe', 'https://github.com/karpathy/minbpe'),
      r('tiktoken', 'https://github.com/openai/tiktoken', 'A production BPE tokenizer to compare against'),
      r('Hugging Face LLM course', 'https://huggingface.co/learn/llm-course')] },
  { id:'p4-transformer', month:4, name:'The transformer', why:'The architecture under almost every model in this plan.',
    resources:[r('The Illustrated Transformer', 'https://jalammar.github.io/illustrated-transformer/'),
      ax('1706.03762', 'Attention Is All You Need'),
      ax('2104.09864', 'RoFormer: Rotary Position Embedding'),
      r('nanoGPT', 'https://github.com/karpathy/nanoGPT')] },
  { id:'p4-pretrain', month:4, name:'Pretraining at scale', why:'Data, scaling laws and parallelism: how the big models are actually made.',
    resources:[r('Stanford CS336: Language Modeling from Scratch', 'https://stanford-cs336.github.io/'),
      r('The Ultra-Scale Playbook', 'https://huggingface.co/spaces/nanotron/ultrascale-playbook', 'Training across many GPUs'),
      r('FineWeb: decanting the web', 'https://huggingface.co/spaces/HuggingFaceFW/blogpost-fineweb-v1', 'How pretraining data is built'),
      ax('2001.08361', 'Scaling Laws for Neural Language Models'),
      ax('2203.15556', 'Training Compute-Optimal Large Language Models'),
      r('PyTorch FSDP', 'https://pytorch.org/docs/stable/fsdp.html')] },
  { id:'p4-efficient', month:4, name:'Efficient architectures', why:'KV caches, fast attention, experts and state-space models: how models got cheaper to run.',
    resources:[ax('2205.14135', 'FlashAttention'), ax('2305.13245', 'GQA: Grouped-Query Attention'),
      ax('2405.04434', 'DeepSeek-V2 (multi-head latent attention)'), ax('2401.04088', 'Mixtral of Experts'),
      ax('2312.00752', 'Mamba'), ax('2309.17453', 'Streaming LLMs with attention sinks')] },
  /* part 5 */
  { id:'p5-sft', month:5, name:'Fine-tuning', why:'Turning a base model into something useful, on a single free GPU.',
    resources:[ax('2106.09685', 'LoRA'), ax('2305.14314', 'QLoRA'),
      r('Hugging Face PEFT', 'https://huggingface.co/docs/peft'), r('Hugging Face TRL', 'https://huggingface.co/docs/trl'),
      r('SmolLM', 'https://github.com/huggingface/smollm', 'Small open models, with training recipes'),
      ax('2212.10560', 'Self-Instruct'), ax('1503.02531', 'Distilling the Knowledge in a Neural Network')] },
  { id:'p5-rl', month:5, name:'Reinforcement learning', why:'The engine behind RLHF and reasoning models — learn it on its own terms first.',
    resources:[r('OpenAI Spinning Up', 'https://spinningup.openai.com/'),
      r('Sutton & Barto: Reinforcement Learning (book)', 'http://incompleteideas.net/book/the-book-2nd.html', 'Free, the standard text'),
      ax('1707.06347', 'Proximal Policy Optimization'),
      r('Gymnasium', 'https://gymnasium.farama.org/', 'The environments')] },
  { id:'p5-pref', month:5, name:'Learning from preferences', why:'How models learn what people want — and how that goes wrong.',
    resources:[ax('2203.02155', 'Training language models to follow instructions (InstructGPT)'),
      ax('2009.01325', 'Learning to summarize from human feedback'), ax('2305.18290', 'Direct Preference Optimization'),
      r('The RLHF Book (Nathan Lambert)', 'https://rlhfbook.com/'), ax('2212.08073', 'Constitutional AI'),
      ax('2306.05685', 'Judging LLM-as-a-Judge')] },
  { id:'p5-reason', month:5, name:'Reasoning', why:'Chain of thought, test-time compute and RL on verifiable rewards: where models got good at maths and code.',
    resources:[ax('2201.11903', 'Chain-of-Thought Prompting'), ax('2203.11171', 'Self-Consistency'),
      ax('2408.03314', 'Scaling test-time compute'), ax('2402.03300', 'DeepSeekMath (GRPO)'),
      ax('2501.12948', 'DeepSeek-R1'), r('Open-R1', 'https://github.com/huggingface/open-r1', 'An open reproduction of R1')] },
  /* part 6 */
  { id:'p6-prompt', month:6, name:'Prompting and AI tools', why:'Getting the most out of models — and out of AI coding tools — is a skill of its own.',
    resources:[r('Anthropic: prompt engineering', 'https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview'),
      r('OpenAI Cookbook', 'https://cookbook.openai.com/'), ax('2201.11903', 'Chain-of-Thought Prompting')] },
  { id:'p6-rag', month:6, name:'Retrieval and RAG', why:'Giving models the right facts at the right time, and measuring whether you did.',
    resources:[ax('2005.11401', 'Retrieval-Augmented Generation'),
      r('Sentence Transformers', 'https://sbert.net/', 'Embeddings and rerankers')] },
  { id:'p6-agents', month:6, name:'Agents and tools', why:'Models that act: tools, loops, MCP — and knowing when an agent is the wrong answer.',
    resources:[r('Anthropic: Building effective agents', 'https://www.anthropic.com/engineering/building-effective-agents'),
      r('Model Context Protocol', 'https://modelcontextprotocol.io/'),
      r('LLM-powered autonomous agents (Lilian Weng)', 'https://lilianweng.github.io/posts/2023-06-23-agent/'),
      ax('2210.03629', 'ReAct'), ax('2302.04761', 'Toolformer'), ax('2302.12173', 'Indirect prompt injection')] },
  { id:'p6-evals', month:6, name:'Evals', why:'If you cannot measure it, you cannot improve it — or trust it.',
    resources:[r('Your AI product needs evals (Hamel Husain)', 'https://hamel.dev/blog/posts/evals/'),
      r('Inspect (UK AI Security Institute)', 'https://inspect.aisi.org.uk/', 'An open eval framework'),
      r('lm-evaluation-harness', 'https://github.com/EleutherAI/lm-evaluation-harness'),
      r('SWE-bench', 'https://www.swebench.com/'), ax('2306.05685', 'Judging LLM-as-a-Judge')] },
  { id:'p6-serve', month:6, name:'Serving and MLOps', why:'Fast, cheap and monitored: the part that decides whether anyone can use what you built.',
    resources:[r('vLLM', 'https://docs.vllm.ai/'), ax('2309.06180', 'PagedAttention'), ax('2211.17192', 'Speculative decoding'),
      ax('2210.17323', 'GPTQ'), ax('2306.00978', 'AWQ'), r('llama.cpp', 'https://github.com/ggml-org/llama.cpp'),
      r('Made With ML', 'https://madewithml.com/', 'MLOps from first principles'), r('Gradio', 'https://www.gradio.app/', 'Demos in a few lines')] },
  /* part 7 */
  { id:'p7-vision', month:7, name:'Vision', why:'Images as sequences of patches, and one space shared by images and text.',
    resources:[ax('2010.11929', 'An Image is Worth 16x16 Words (ViT)'), ax('2103.00020', 'CLIP'), ax('2304.02643', 'Segment Anything'),
      r('Stanford CS231n notes', 'https://cs231n.github.io/'), r('Hugging Face computer vision course', 'https://huggingface.co/learn/computer-vision-course')] },
  { id:'p7-gen', month:7, name:'Generative models', why:'Diffusion and flow matching: how images, video and audio are generated.',
    resources:[r('What are diffusion models? (Lilian Weng)', 'https://lilianweng.github.io/posts/2021-07-11-diffusion-models/'),
      ax('2006.11239', 'Denoising Diffusion Probabilistic Models'), ax('2207.12598', 'Classifier-Free Guidance'),
      ax('2112.10752', 'Latent Diffusion'), ax('2210.02747', 'Flow Matching'), r('Hugging Face Diffusers', 'https://huggingface.co/docs/diffusers')] },
  { id:'p7-audio', month:7, name:'Speech and audio', why:'Speech in and speech out — the most natural interface there is.',
    resources:[ax('2212.04356', 'Whisper'), r('Hugging Face audio course', 'https://huggingface.co/learn/audio-course')] },
  { id:'p7-multi', month:7, name:'Multimodal models and robots', why:'Vision-language models, and models that act in the physical world — where your Robots track meets this one.',
    resources:[ax('2304.08485', 'Visual Instruction Tuning (LLaVA)'), ax('2304.13705', 'ACT: action chunking'),
      ax('2303.04137', 'Diffusion Policy'), ax('2307.15818', 'RT-2'), ax('2406.09246', 'OpenVLA'),
      r('LeRobot', 'https://github.com/huggingface/lerobot')] },
  /* part 8 */
  { id:'p8-interp', month:8, name:'Interpretability', why:'Opening the black box: finding the algorithms and features inside a trained model.',
    resources:[r('Transformer Circuits', 'https://transformer-circuits.pub/'),
      r('Getting started in mechanistic interpretability (Neel Nanda)', 'https://www.neelnanda.io/mechanistic-interpretability/getting-started'),
      r('TransformerLens', 'https://github.com/TransformerLensOrg/TransformerLens'),
      r('Towards Monosemanticity', 'https://transformer-circuits.pub/2023/monosemantic-features', 'Sparse autoencoders'),
      ax('2211.00593', 'A circuit for indirect object identification'), ax('2202.05262', 'Locating and Editing Factual Associations (ROME)'),
      r('ARENA', 'https://arena.education/', 'Free, hands-on alignment research engineering')] },
  { id:'p8-steer', month:8, name:'Probing and steering', why:'Reading information out of activations, and changing behaviour by editing them.',
    resources:[ax('2308.10248', 'Steering with activation addition'), ax('2310.01405', 'Representation Engineering'),
      ax('2212.03827', 'Discovering Latent Knowledge without supervision')] },
  { id:'p8-safety', month:8, name:'Alignment and security', why:'How AI goes wrong, how it is attacked, and how to defend it.',
    resources:[ax('1606.06565', 'Concrete Problems in AI Safety'), ax('2209.13085', 'Defining and Characterizing Reward Hacking'),
      ax('2307.02483', 'Jailbroken: how safety training fails'), ax('2202.03286', 'Red Teaming Language Models with Language Models'),
      r('BlueDot Impact', 'https://bluedot.org/', 'Free AI safety courses'), r('Alignment Forum', 'https://www.alignmentforum.org/')] },
  { id:'p8-research', month:8, name:'Doing research', why:'Reading fast, choosing a question you can answer, and showing the work.',
    resources:[r('How to Read a Paper (Keshav)', 'https://web.stanford.edu/class/ee384m/Handouts/HowtoReadPaper.pdf', 'The three-pass method'),
      r('Hugging Face Papers', 'https://huggingface.co/papers', 'What researchers are reading today')] },
  /* frontier */
  { id:'frontier', month:0, name:'The frontier', why:'AI changes every week. One day a week goes to whatever just dropped — tried by hand, not just read about.',
    resources:[r('Hugging Face Papers', 'https://huggingface.co/papers', 'The most upvoted new research'),
      r('Trending models on Hugging Face', 'https://huggingface.co/models?sort=trending'),
      r('GitHub trending', 'https://github.com/trending')] },
];
export const topicById = id => TOPICS.find(t => t.id === id);
export const topicsIn = n => TOPICS.filter(t => t.month === n);

/* --------------------------------- builds --------------------------------- */

const ARX = (id, what) => ({ label: `Links the paper (arXiv ${id})${what ? ` — ${what}` : ''}`, re: new RegExp(`arxiv\\.org/(?:abs|pdf)/${id.replace('.', '\\.')}`, 'i') });
const PCT = (label, min = 1) => ({ label, re: /\b\d{1,3}(?:\.\d+)?\s*%/, min });
const NUM = (label, min = 1) => ({ label, re: /\b\d+\.\d+\b/, min });
const HAS = (label, re) => ({ label, re });
const CODE = { label: 'Python code or a notebook', re: /\.(?:py|ipynb)$/i };
const TESTS = { label: 'Tests (test_*.py)', re: /(?:^|\/)test_[^/]*\.py$|_test\.py$/i };
const FREE = 'Free — a laptop or a free Colab/Kaggle GPU';
const CHEAP = 'Cheap — about $10–50 of rented GPU time (RunPod, Lambda, Vast.ai)';

export const BUILDS = [
  /* part 1 */
  { id:'a1', month:1, topic:'p1-linalg', name:'Linear algebra from scratch, tested', cost:FREE, compute:'free', verify:'github',
    task:'Implement matrix multiplication, determinants, a linear solver, power iteration and PCA in plain Python, with tests that compare every one against NumPy. Then run PCA on a real dataset.',
    proof:{ ci:true, files:[TESTS], readme:[HAS('PCA with the explained variance', /explained variance/i), PCT('The explained variance as a %')] } },
  { id:'a2', month:1, topic:'p1-calc', name:'Gradient descent, visualised', cost:FREE, compute:'free', verify:'github',
    task:'Implement gradient descent, momentum, RMSProp and Adam on a 2-D bowl and on the Rosenbrock function. Plot every path on the same picture, and report the final loss and steps to converge for each.',
    proof:{ files:[CODE], readme:[HAS('Momentum', /momentum/i), HAS('Adam', /\badam\b/i), HAS('Rosenbrock', /rosenbrock/i), NUM('Final losses for each optimiser', 3)] } },
  { id:'a3', month:1, topic:'p1-prob', name:'An A/B test, two ways', cost:FREE, compute:'free', verify:'github',
    task:'Take a public A/B-style dataset. Answer "is B better?" with a confidence interval and a hypothesis test, then again with a Bayesian posterior — and say where the two answers agree.',
    proof:{ files:[CODE], readme:[HAS('A confidence interval', /confidence interval/i), HAS('A p-value', /p[- ]?value/i), HAS('A posterior', /posterior/i)] } },
  { id:'c1', month:1, topic:'p1-opt', name:'Reproduce: Adam', cost:FREE, compute:'free', verify:'github', capstone:true,
    task:'Implement Adam exactly as the paper describes, and reproduce its logistic-regression comparison on MNIST against SGD with Nesterov momentum, AdaGrad and RMSProp — with seeds, a learning-rate sweep, and the paper\'s figure beside yours.',
    proof:{ files:[CODE], readme:[ARX('1412.6980'), HAS('AdaGrad', /adagrad/i), HAS('RMSProp', /rmsprop/i), HAS('Seeds', /\bseeds?\b/i)] } },
  /* part 2 */
  { id:'a4', month:2, topic:'p2-models', name:'Beat the baseline on tables', cost:FREE, compute:'free', verify:'github',
    task:'On a public tabular dataset, compare a dumb baseline, regularised logistic regression and gradient boosting with proper cross-validation. One table of results, and a paragraph on how you ruled out leakage.',
    proof:{ files:[CODE], readme:[HAS('A baseline', /baseline/i), HAS('Cross-validation', /cross[- ]?validat/i), HAS('Gradient boosting', /boost/i), NUM('Scores for each model', 3), HAS('Leakage', /leak/i)] } },
  { id:'a5', month:2, topic:'p2-recsys', name:'A recommender that beats popularity', cost:FREE, compute:'free', verify:'github',
    task:'On MovieLens, build the bias baseline and matrix factorisation. Measure RMSE on held-out ratings and precision@10 against a popularity recommender.',
    proof:{ files:[CODE], readme:[HAS('MovieLens', /movielens/i), HAS('RMSE', /\brmse\b/i), HAS('Precision@10', /precision\s*@\s*10|p@10/i), NUM('The numbers', 2)] } },
  { id:'a6', month:2, topic:'p2-time', name:'A forecaster, backtested', cost:FREE, compute:'free', verify:'github',
    task:'Forecast a public time series. Backtest with a rolling origin against naive and seasonal-naive baselines, then ETS or ARIMA and gradient boosting on lag features. Report MAE for each.',
    proof:{ files:[CODE], readme:[HAS('Seasonal naive baseline', /seasonal[- ]naive/i), HAS('Backtesting', /backtest/i), HAS('MAE', /\bmae\b/i), NUM('Errors for each model', 3)] } },
  { id:'c2', month:2, topic:'p2-models', name:'Reproduce: trees vs deep learning on tables', cost:FREE, compute:'free', verify:'github', capstone:true,
    task:'Take three datasets from the benchmark in "Why do tree-based models still outperform deep learning on tabular data?". Give XGBoost, a random forest and an MLP the same random-search budget, and plot score against search iterations as the paper does.',
    proof:{ files:[CODE], readme:[ARX('2207.08815'), HAS('XGBoost', /xgboost/i), HAS('Random forest', /random forest/i), HAS('An MLP', /\bmlp\b/i)] } },
  /* part 3 */
  { id:'a7', month:3, topic:'p3-nets', name:'Your own autograd', cost:FREE, compute:'free', verify:'github',
    task:'Write a scalar autograd engine and a small MLP on top of it, micrograd-style. Test every operation\'s gradient against PyTorch on random graphs, in GitHub Actions.',
    proof:{ ci:true, files:[TESTS], readme:[HAS('Compared with PyTorch', /pytorch/i), HAS('Backpropagation', /backprop/i)] } },
  { id:'a8', month:3, topic:'p3-train', name:'MNIST three ways', cost:FREE, compute:'free', verify:'github',
    task:'Classify MNIST with an MLP in NumPy only (your own forward and backward pass), the same MLP in PyTorch, and a small CNN. Compare test accuracy and training time.',
    proof:{ files:[CODE], readme:[HAS('NumPy', /numpy/i), HAS('A CNN', /\bcnn\b|convolution/i), PCT('Test accuracy for each', 3)] } },
  { id:'a9', month:3, topic:'p3-gpu', name:'Make training fast', cost:FREE, compute:'free', verify:'github',
    task:'Profile a CIFAR-10 training loop on a GPU. Add mixed precision, a bigger batch and torch.compile; write one fused operation in Triton. Report throughput before and after each change.',
    proof:{ files:[CODE], readme:[HAS('Mixed precision', /mixed precision|bf16|fp16/i), HAS('torch.compile or Triton', /torch\.compile|triton/i), { label:'Throughput numbers (per second)', re:/\d[\d,.]*\s*(?:it|img|images|samples|tokens)\s*\/\s*s/i, min:2 }] } },
  { id:'c3', month:3, topic:'p3-cnn', name:'Reproduce: ResNet\'s degradation result', cost:'Free — a few hours on a Colab or Kaggle GPU', compute:'free', verify:'github', capstone:true,
    task:'Train plain and residual networks at 20 and 56 layers on CIFAR-10, as the ResNet paper describes, with one recipe and budget. Show that the deeper plain net trains worse, and that residual connections fix it.',
    proof:{ files:[CODE], readme:[ARX('1512.03385'), HAS('Plain networks', /plain/i), HAS('Residual networks', /residual/i), PCT('Error rates', 4)] } },
  /* part 4 */
  { id:'a10', month:4, topic:'p4-lm', name:'Your own BPE tokenizer', cost:FREE, compute:'free', verify:'github',
    task:'Implement byte-level BPE training, encoding and decoding. Test that decode(encode(x)) == x on messy Unicode, train it on a real corpus, and compare its compression with tiktoken.',
    proof:{ ci:true, files:[TESTS], readme:[HAS('Vocabulary size', /vocab/i), HAS('Compared with tiktoken', /tiktoken/i), NUM('Compression (characters or bytes per token)')] } },
  { id:'a11', month:4, topic:'p4-transformer', name:'A GPT from an empty file', cost:FREE, compute:'free', verify:'github',
    task:'Write a GPT from scratch and train it on TinyShakespeare or TinyStories. Then add RoPE and RMSNorm and compare validation loss. Include samples.',
    proof:{ files:[CODE], readme:[HAS('Validation loss', /val(?:idation)?\s*loss/i), NUM('Loss values', 2), HAS('RoPE', /\brope\b|rotary/i)] } },
  { id:'a12', month:4, topic:'p4-pretrain', name:'Pretrain a small language model', cost:CHEAP, compute:'cheap', verify:'hf',
    task:'Pretrain a 10–100M-parameter model on a FineWeb-Edu sample. Keep the loss curve, evaluate it, and publish it on Hugging Face with a model card that states its size, data and results.',
    proof:{ hf:{ kind:'model', card:[HAS('Its size in parameters', /\d+(?:\.\d+)?\s*[MB]\b|param/i), HAS('The training data', /fineweb|dataset|tokens/i), NUM('Loss or perplexity')] } } },
  { id:'c4', month:4, topic:'p4-pretrain', name:'Reproduce: Chinchilla at tiny scale', cost:CHEAP, compute:'cheap', verify:'github', capstone:true,
    task:'Pick a small fixed compute budget and 4–5 model sizes that fit it. Train each to the same compute, plot final loss against size, find the loss-optimal size, and compare its tokens-per-parameter with Chinchilla\'s roughly 20.',
    proof:{ files:[CODE], readme:[ARX('2203.15556'), HAS('The compute budget', /flops|compute budget/i), HAS('Tokens per parameter', /tokens?\s*per\s*param/i), { label:'Four or more model sizes', re:/\b\d+(?:\.\d+)?\s*M\b/, min:4 }] } },
  /* part 5 */
  { id:'a13', month:5, topic:'p5-sft', name:'Fine-tune with LoRA', cost:FREE, compute:'free', verify:'hf',
    task:'Fine-tune a small open model with LoRA (QLoRA on a free GPU) on an instruction dataset. Evaluate before and after on the same held-out prompts, and publish the adapter with a card.',
    proof:{ hf:{ kind:'model', card:[HAS('LoRA', /\bq?lora\b/i), HAS('The base model', /base model|base_model/i), NUM('Before-and-after scores', 2)] } } },
  { id:'a14', month:5, topic:'p5-rl', name:'RL from scratch', cost:FREE, compute:'free', verify:'github',
    task:'Implement REINFORCE, then REINFORCE with a baseline, then PPO, on CartPole. Plot average return per episode for all three on one chart.',
    proof:{ files:[CODE], readme:[HAS('REINFORCE', /reinforce/i), HAS('PPO', /\bppo\b/i), HAS('CartPole', /cartpole/i), { label:'Average returns', re:/return[^\n]*\d{2,3}/i }] } },
  { id:'a15', month:5, topic:'p5-pref', name:'Preference-tune with DPO', cost:FREE, compute:'free', verify:'github',
    task:'Build or pick a preference dataset for your fine-tuned model and run DPO with TRL. Judge 50 prompts, SFT against DPO, and report the win rate — with a note on the judge\'s own biases.',
    proof:{ files:[CODE], readme:[HAS('DPO', /\bdpo\b/i), PCT('A win rate'), HAS('The judge', /judge/i)] } },
  { id:'c5', month:5, topic:'p5-reason', name:'Reproduce: R1-Zero at small scale', cost:CHEAP, compute:'cheap', verify:'hf', capstone:true,
    task:'Train a small model with GRPO on GSM8K using an exact-answer reward, as DeepSeek-R1-Zero does at scale. Track accuracy and response length through training, and publish the model with a card that reports both.',
    proof:{ hf:{ kind:'model', card:[ARX('2501.12948'), HAS('GRPO', /grpo/i), HAS('GSM8K', /gsm8k/i), PCT('Accuracy before and after', 2)] } } },
  /* part 6 */
  { id:'a16', month:6, topic:'p6-rag', name:'RAG you can measure', cost:FREE, compute:'free', verify:'github',
    task:'Build retrieval over your own documents: chunking, embeddings, keyword search and a reranker. Write 30 questions with known answers and measure recall@5 and answer accuracy as you add each piece.',
    proof:{ files:[CODE], readme:[HAS('Recall@k', /recall\s*@\s*\d/i), HAS('A reranker', /rerank/i), PCT('Accuracy numbers', 2)] } },
  { id:'a17', month:6, topic:'p6-agents', name:'An agent and an MCP server', cost:FREE, compute:'free', verify:'github',
    task:'Build an MCP server that exposes two or three real tools, and an agent that uses them. Run it on 20 tasks, report the success rate, and sort the failures into types.',
    proof:{ files:[{ label:'Server code', re:/\.(?:py|ts|js)$/i }], readme:[HAS('MCP', /\bmcp\b|model context protocol/i), PCT('A success rate'), HAS('Failure types', /fail/i)] } },
  { id:'a18', month:6, topic:'p6-evals', name:'Evals in CI', cost:FREE, compute:'free', verify:'github',
    task:'Build an eval harness — a golden set, exact checks and an LLM judge — that runs in GitHub Actions on every push. Measure how often the judge agrees with your own labels.',
    proof:{ ci:true, files:[CODE], readme:[HAS('A golden set', /golden/i), HAS('An LLM judge', /judge/i), PCT('Judge agreement')] } },
  { id:'a19', month:6, topic:'p6-serve', name:'Serve a model fast', cost:FREE, compute:'free', verify:'hf',
    task:'Serve an open model with vLLM or llama.cpp, quantize it, and measure tokens per second and p95 latency before and after. Put a demo up as a Hugging Face Space, with the numbers in its README.',
    proof:{ hf:{ kind:'space', card:[{ label:'Tokens per second', re:/tokens?\s*\/\s*s|tok\/s|tokens per second/i }, HAS('Latency', /latency|p95/i), HAS('Quantization', /quantiz|int8|4-?bit|gguf|awq|gptq/i)] } } },
  { id:'c6', month:6, topic:'p6-agents', name:'Reproduce: ReAct', cost:FREE, compute:'free', verify:'github', capstone:true,
    task:'On 100 HotpotQA questions with an open model, compare act-only, chain-of-thought and ReAct agents with the same model and budget. Report exact-match accuracy with confidence intervals, and categorise 30 failures of each.',
    proof:{ files:[CODE], readme:[ARX('2210.03629'), HAS('HotpotQA', /hotpot/i), HAS('Chain of thought', /chain[- ]of[- ]thought|\bcot\b/i), PCT('Accuracy for each agent', 3)] } },
  /* part 7 */
  { id:'a20', month:7, topic:'p7-vision', name:'Search images with CLIP', cost:FREE, compute:'free', verify:'hf',
    task:'Use CLIP for zero-shot classification on a public dataset and for text-to-image search over it. Report accuracy, and put it up as a Hugging Face Space.',
    proof:{ hf:{ kind:'space', card:[HAS('CLIP', /\bclip\b/i), PCT('Zero-shot accuracy')] } } },
  { id:'a21', month:7, topic:'p7-gen', name:'Diffusion from scratch', cost:FREE, compute:'free', verify:'github',
    task:'Implement DDPM on MNIST — the noise schedule, a small U-Net and the sampler. Add class conditioning and classifier-free guidance, then a flow-matching version, and compare samples and steps.',
    proof:{ files:[CODE], readme:[HAS('DDPM', /ddpm|diffusion/i), HAS('Classifier-free guidance', /classifier[- ]free|guidance/i), HAS('Flow matching', /flow matching/i)] } },
  { id:'a22', month:7, topic:'p7-audio', name:'A voice assistant', cost:FREE, compute:'free', verify:'github',
    task:'Wire Whisper speech-to-text into a language model and a text-to-speech model. Measure word error rate on 20 of your own recordings and end-to-end latency, then cut the latency.',
    proof:{ files:[CODE], readme:[HAS('Whisper', /whisper/i), PCT('Word error rate'), { label:'Latency', re:/\d+(?:\.\d+)?\s*(?:ms|s)\b/i, min:2 }] } },
  { id:'c7', month:7, topic:'p7-multi', name:'Reproduce: Diffusion Policy on Push-T', cost:'Free to cheap — a free GPU works, slowly', compute:'free', verify:'github', capstone:true,
    task:'Train a diffusion policy on the Push-T simulation with LeRobot. Evaluate over at least 50 rollouts, record videos of success and failure, and compare with the paper and with an ACT baseline.',
    proof:{ video:1, files:[CODE], readme:[ARX('2303.04137'), HAS('Push-T', /push-?t/i), PCT('A success rate'), HAS('Rollouts', /rollout/i)] } },
  /* part 8 */
  { id:'a24', month:8, topic:'p8-interp', name:'Find a circuit', cost:FREE, compute:'free', verify:'github',
    task:'In GPT-2 small with TransformerLens, reproduce the indirect-object-identification behaviour and use activation patching to find the heads that carry it. Plot the patching results.',
    proof:{ files:[CODE], readme:[HAS('TransformerLens', /transformerlens/i), HAS('Activation patching', /patch/i), { label:'Heads named (like 9.9)', re:/\b(?:head\s*)?\d{1,2}\.\d{1,2}\b/i, min:2 }] } },
  { id:'a25', month:8, topic:'p8-interp', name:'Train a sparse autoencoder', cost:FREE, compute:'free', verify:'hf',
    task:'Train a sparse autoencoder on one layer of a small model\'s residual stream. Report L0 and reconstruction loss, label ten features with examples, and publish the SAE with a card.',
    proof:{ hf:{ kind:'model', card:[HAS('Sparse autoencoder', /sparse autoencoder|\bsae\b/i), HAS('L0', /\bl0\b/i), HAS('Features', /feature/i)] } } },
  { id:'a26', month:8, topic:'p8-safety', name:'Red-team your own model', cost:FREE, compute:'free', verify:'github',
    task:'Build an attack suite — jailbreaks and prompt injections — against your own fine-tuned model. Measure the attack success rate, add a defence, measure again, and check the defence did not break normal use.',
    proof:{ files:[CODE], readme:[HAS('Attack success rate', /attack success|\basr\b/i), PCT('Before and after', 2), HAS('A defence', /defen[cs]e/i)] } },
  { id:'a27', month:8, topic:'p8-research', name:'Your AI portfolio', cost:'$0', compute:'free', verify:'portfolio',
    task:'Rewrite your five best builds so each opens with a figure, states its numbers and says what failed. Link them from a profile README with your Hugging Face work.',
    proof:{ meta:'portfolio', count:5 } },
  { id:'c8', month:8, topic:'p8-steer', name:'Reproduce: latent knowledge without supervision', cost:FREE, compute:'free', verify:'github', capstone:true,
    task:'Reproduce Contrast-Consistent Search on a small open model: find a direction that separates true from false statements with no labels, and compare it with a supervised probe and with zero-shot prompting.',
    proof:{ files:[CODE], readme:[ARX('2212.03827'), HAS('Contrast-consistent search', /contrast[- ]consistent|\bccs\b/i), HAS('A supervised probe', /supervised|logistic/i), PCT('Accuracies', 2)] } },
];
export const buildById = id => BUILDS.find(b => b.id === id);
export const buildsIn = n => BUILDS.filter(b => b.month === n);
export const capstoneOf = n => BUILDS.find(b => b.month === n && b.capstone);
export const buildXp = b => 200 + b.month * 75 + (b.capstone ? 300 : 0);
export const buildCoins = b => 40 + b.month * 15 + (b.capstone ? 60 : 0);

/* ---------------------------------- days ---------------------------------- */

const D = (learn, topic, skills = [], build = null) => ({ learn, topic, skills, build });
const FRONTIER = () => ({ learn: 'Frontier day: pick one thing that dropped this week, learn it with AI, try it by hand, and log it.', topic: 'frontier', skills: [], build: null, frontier: true });
const REVIEW = (topic, id) => D('Review: your weakest skills come back harder. Ship the reproduction.', topic, [], [id, 'ship']);
const BOSS = topic => D('Boss day.', topic);

const DAYS = [
  /* ============================ Part 1 — maths ============================ */
  D('Vectors, dot products and cosine similarity — the geometry of embeddings', 'p1-linalg', ['dot'], ['a1', 'plan']),
  D('Matrices as functions: multiplication, shapes and broadcasting', 'p1-linalg', ['matmul'], ['a1', 'make', 'Implement matmul, transpose and dot products in plain Python, with pytest tests against NumPy']),
  D('Determinants, inverses and rank: when a system has no single answer', 'p1-linalg', [], ['a1', 'make', 'Add determinants and a linear solver; test them against numpy.linalg']),
  D('Eigenvalues and eigenvectors: the directions a matrix only stretches', 'p1-linalg', ['eigen'], ['a1', 'make', 'Implement power iteration, and PCA through the SVD']),
  D('SVD and PCA: keeping the directions that matter', 'p1-linalg', [], ['a1', 'test', 'Run PCA on a real dataset, report the explained variance, and get GitHub Actions green']),
  D('Testing numerical code: tolerances, seeds and CI', 'p1-tools', [], ['a1', 'ship']),
  FRONTIER(),
  D('Derivatives and the chain rule — backprop in one line', 'p1-calc', ['deriv'], ['a2', 'plan']),
  D('Partial derivatives, gradients and steepest ascent', 'p1-calc', ['grad'], ['a2', 'make', 'Gradient descent on a 2-D bowl and on the Rosenbrock function, with the paths plotted']),
  D('Jacobians: gradients of vector-valued functions', 'p1-calc', [], ['a2', 'make', 'Add momentum and RMSProp, on the same plot']),
  D('Learning rates, momentum, and why steps oscillate', 'p1-opt', [], ['a2', 'make', 'Add Adam; log each optimiser\'s final loss and steps to converge']),
  D('Convexity: when descent is guaranteed to work — and why deep nets are not convex', 'p1-opt', [], ['a2', 'test']),
  D('Checking derivatives with finite differences', 'p1-calc', [], ['a2', 'ship']),
  FRONTIER(),
  D('Random variables, expectation and variance', 'p1-prob', ['expvar'], ['a3', 'plan']),
  D('Bayes\' theorem: updating beliefs with evidence', 'p1-prob', ['bayes'], ['a3', 'make', 'Pick an A/B-style dataset; write down the question and the metric before looking']),
  D('The distributions you will meet: Bernoulli, binomial, Gaussian, categorical', 'p1-prob', [], ['a3', 'make', 'A confidence interval and a hypothesis test for the difference']),
  D('Maximum likelihood: why training minimises log-loss', 'p1-prob', [], ['a3', 'make', 'The Bayesian version: a Beta posterior for each group, and P(B > A)']),
  D('Confidence intervals and p-values — and the mistakes everyone makes with them', 'p1-prob', [], ['a3', 'test']),
  D('Entropy, cross-entropy and KL — the losses behind every classifier and LLM', 'p1-opt', ['entropy'], ['a3', 'ship']),
  FRONTIER(),
  D('Reading a paper: abstract, figures, method, then the maths', 'p1-opt', [], ['c1', 'plan']),
  D('Adam from the paper: moment estimates and bias correction', 'p1-opt', [], ['c1', 'make', 'Implement Adam exactly as Algorithm 1 in the paper']),
  D('Weight decay against L2 — and why AdamW exists', 'p1-opt', [], ['c1', 'make', 'Logistic regression on MNIST with SGD+Nesterov, AdaGrad, RMSProp and Adam']),
  D('Plotting training curves honestly: log scales, seeds and bands', 'p1-tools', [], ['c1', 'make', 'Three seeds each; plot cost against iterations like the paper\'s figure']),
  D('Comparing optimisers fairly: tuning budgets and learning-rate sweeps', 'p1-opt', [], ['c1', 'make', 'Sweep the learning rate for each, and say exactly what you tuned']),
  D('When a reproduction disagrees with the paper', 'p1-opt', [], ['c1', 'test', 'Put your curves beside the paper\'s; write what matched and what did not']),
  FRONTIER(),
  REVIEW('p1-opt', 'c1'),
  BOSS('p1-opt'),

  /* ========================= Part 2 — classic ML ========================== */
  D('The workflow: train, validation and test — and leakage, the silent killer', 'p2-workflow', [], ['a4', 'plan']),
  D('Linear regression and least squares', 'p2-models', ['linreg'], ['a4', 'make', 'Load a public tabular dataset and set up a cross-validated dumb baseline']),
  D('Logistic regression and the sigmoid', 'p2-models', ['logit'], ['a4', 'make', 'Regularised logistic regression, tuned with cross-validation']),
  D('Metrics: precision, recall, F1 and ROC-AUC — and which your problem needs', 'p2-workflow', ['metrics', 'auc'], ['a4', 'make', 'Gradient boosting (XGBoost or LightGBM), with a few key parameters tuned']),
  D('Decision trees: splits, impurity and overfitting', 'p2-models', ['gini'], ['a4', 'test', 'One results table against the baseline, and a leakage check']),
  D('Random forests and gradient boosting — why boosting wins on tables', 'p2-models', [], ['a4', 'ship']),
  FRONTIER(),
  D('Regularisation: L1, L2 and the bias–variance trade-off', 'p2-models', [], ['a5', 'plan']),
  D('Features: engineering, categoricals and missing values', 'p2-workflow', [], ['a5', 'make', 'MovieLens 100k: the global-mean and user/item-bias baselines']),
  D('Recommenders: collaborative filtering, and why popularity is a hard baseline', 'p2-recsys', ['mf'], ['a5', 'make', 'Matrix factorisation, with RMSE on a held-out split']),
  D('Matrix factorisation and implicit feedback', 'p2-recsys', [], ['a5', 'make', 'Ranking: precision@10 against the popularity recommender']),
  D('Evaluating recommenders: ranking metrics, offline and online', 'p2-recsys', [], ['a5', 'test']),
  D('Cold start, diversity and feedback loops', 'p2-recsys', [], ['a5', 'ship']),
  FRONTIER(),
  D('Clustering: k-means and its failure modes', 'p2-unsup', ['kmeans'], ['a6', 'plan']),
  D('DBSCAN, hierarchical clustering and choosing k', 'p2-unsup', [], ['a6', 'make', 'Pick a public time series; plot it and name its trend and seasonality']),
  D('PCA, t-SNE and UMAP — and how pictures of embeddings mislead', 'p2-unsup', [], ['a6', 'make', 'Rolling-origin backtesting with naive and seasonal-naive baselines']),
  D('Time series: trend, seasonality and the naive forecast', 'p2-time', ['forecast'], ['a6', 'make', 'ETS or ARIMA, and gradient boosting on lag features']),
  D('Backtesting and forecast errors: MAE, RMSE, MAPE', 'p2-time', [], ['a6', 'test']),
  D('Imbalanced data, calibration and choosing a threshold', 'p2-workflow', [], ['a6', 'ship']),
  FRONTIER(),
  D('Why trees still win on tables — reading the benchmark paper', 'p2-models', [], ['c2', 'plan']),
  D('Hyperparameter search: random search, budgets and fairness', 'p2-workflow', [], ['c2', 'make', 'Three datasets from the paper\'s benchmark, preprocessed the same way']),
  D('Neural networks for tables: what the paper tried', 'p2-models', [], ['c2', 'make', 'XGBoost and a random forest with a random-search budget']),
  D('Comparing models across datasets without fooling yourself', 'p2-workflow', [], ['c2', 'make', 'An MLP with the same budget']),
  D('What makes tabular data hard for neural networks', 'p2-models', [], ['c2', 'make', 'Score against search iterations, plotted like the paper']),
  D('Writing up a reproduction: claims, evidence and gaps', 'p2-workflow', [], ['c2', 'test']),
  FRONTIER(),
  REVIEW('p2-models', 'c2'),
  BOSS('p2-models'),

  /* ======================= Part 3 — deep learning ======================== */
  D('A neuron, a layer, an MLP — and what learning actually changes', 'p3-nets', [], ['a7', 'plan']),
  D('Backprop by hand on a tiny graph', 'p3-nets', ['backprop'], ['a7', 'make', 'A Value class that records operations and backpropagates, like micrograd']),
  D('Autograd: topological order and the chain rule, automated', 'p3-nets', [], ['a7', 'make', 'Add tanh, exp and powers; build an MLP; train it on a toy problem']),
  D('Softmax and cross-entropy, computed stably', 'p3-nets', ['softmax'], ['a7', 'make', 'Tests comparing every gradient with PyTorch on random graphs']),
  D('Parameters and shapes: counting what a network learns', 'p3-nets', ['params'], ['a7', 'test', 'Get the GitHub Actions run green']),
  D('Initialisation: why the scale of the first weights decides everything', 'p3-train', ['init'], ['a7', 'ship']),
  FRONTIER(),
  D('Optimisers in practice: SGD, momentum, Adam, AdamW and schedules', 'p3-train', ['adam'], ['a8', 'plan']),
  D('Normalisation: BatchNorm and LayerNorm', 'p3-train', [], ['a8', 'make', 'An MLP on MNIST in NumPy only, forward and backward by hand']),
  D('Regularisation: dropout, weight decay and augmentation', 'p3-train', [], ['a8', 'make', 'The same in PyTorch, with a DataLoader and a proper training loop']),
  D('PyTorch properly: tensors, modules, DataLoaders and the loop', 'p3-torch', [], ['a8', 'make', 'A small CNN; compare all three on test accuracy and time']),
  D('Convolutions: kernels, stride, padding and receptive fields', 'p3-cnn', ['convout'], ['a8', 'test']),
  D('Debugging training: overfit one batch, read the curve, check the data', 'p3-train', [], ['a8', 'ship']),
  FRONTIER(),
  D('GPUs: why matrix multiplies are fast and memory is the bottleneck', 'p3-gpu', ['flops'], ['a9', 'plan']),
  D('Memory: weights, gradients, optimiser state and activations', 'p3-gpu', ['mem'], ['a9', 'make', 'Profile a CIFAR-10 training loop: where does the time go?']),
  D('Mixed precision: fp16, bf16 and fp8', 'p3-gpu', [], ['a9', 'make', 'Mixed precision and a bigger batch; measure throughput']),
  D('torch.compile, fused kernels and when to write your own', 'p3-gpu', [], ['a9', 'make', 'torch.compile, and one fused operation in Triton, timed']),
  D('Recurrent nets and LSTMs — what transformers replaced, and why', 'p3-nets', [], ['a9', 'test']),
  D('Transfer learning: pretrained backbones and fine-tuning', 'p3-cnn', [], ['a9', 'ship']),
  FRONTIER(),
  D('Residual connections: why deeper plain nets train worse', 'p3-cnn', [], ['c3', 'plan']),
  D('Reading the ResNet paper: the degradation problem', 'p3-cnn', [], ['c3', 'make', 'Plain and residual CIFAR-10 nets at 20 and 56 layers, as described']),
  D('Training recipes: schedules, augmentation and batch-norm details', 'p3-train', [], ['c3', 'make', 'Train all four with the same recipe and budget']),
  D('Experiment tracking: logging runs you can trust', 'p3-torch', [], ['c3', 'make', 'Training and test error against iterations, like the paper\'s figures']),
  D('Error bars and seeds: is the difference real?', 'p3-train', [], ['c3', 'make', 'A second seed for the key runs']),
  D('What reproduced, what did not, and why', 'p3-cnn', [], ['c3', 'test']),
  FRONTIER(),
  REVIEW('p3-cnn', 'c3'),
  BOSS('p3-cnn'),

  /* ======================= Part 4 — LLMs from scratch ===================== */
  D('Language modelling: predicting the next token, from bigrams to neural nets', 'p4-lm', [], ['a10', 'plan']),
  D('Tokenization: bytes, BPE merges, and why tokens explain so many LLM quirks', 'p4-lm', ['bpe'], ['a10', 'make', 'Byte-level BPE training: count pairs, merge, repeat']),
  D('Embeddings: tokens as vectors, and what the vectors learn', 'p4-lm', [], ['a10', 'make', 'Encode and decode, tested round-trip on messy Unicode']),
  D('Attention from scratch: queries, keys and values', 'p4-transformer', ['attn'], ['a10', 'make', 'Train it on a real corpus; report vocabulary size and compression']),
  D('Masking and multi-head attention', 'p4-transformer', [], ['a10', 'test', 'Compare its compression with tiktoken on the same text']),
  D('The transformer block: residuals, LayerNorm or RMSNorm, and the MLP', 'p4-transformer', ['llmparams'], ['a10', 'ship']),
  FRONTIER(),
  D('Position: sinusoids, learned positions and RoPE', 'p4-transformer', [], ['a11', 'plan']),
  D('Training a GPT: next-token loss and perplexity', 'p4-lm', ['perplexity'], ['a11', 'make', 'A GPT from an empty file, following "Let\'s build GPT"']),
  D('Sampling: temperature, top-k and top-p', 'p4-lm', ['sampling'], ['a11', 'make', 'Train on TinyShakespeare or TinyStories; log train and validation loss']),
  D('Scaling laws: loss as a power law in parameters, data and compute', 'p4-pretrain', [], ['a11', 'make', 'Add RoPE and RMSNorm; compare validation loss']),
  D('Compute-optimal training: the Chinchilla result', 'p4-pretrain', ['chinchilla'], ['a11', 'test']),
  D('Pretraining data: crawling, filtering and deduplication', 'p4-pretrain', [], ['a11', 'ship']),
  FRONTIER(),
  D('Many GPUs: data, tensor and pipeline parallelism, FSDP and ZeRO', 'p4-pretrain', [], ['a12', 'plan']),
  D('The KV cache: why generation is memory-bound', 'p4-efficient', ['kvcache'], ['a12', 'make', 'A FineWeb-Edu sample, tokenized into shards']),
  D('FlashAttention: the same maths with far less memory traffic', 'p4-efficient', [], ['a12', 'make', 'Pretrain a 10–100M-parameter model on it; keep the loss curve']),
  D('Grouped-query and latent attention: shrinking the KV cache', 'p4-efficient', [], ['a12', 'make', 'Evaluate it, and write a model card']),
  D('Mixture of experts: more parameters, same compute per token', 'p4-efficient', ['moe'], ['a12', 'test', 'Publish it on Hugging Face with the card']),
  D('State-space models and Mamba: sequence models without attention', 'p4-efficient', [], ['a12', 'ship']),
  FRONTIER(),
  D('Reading Chinchilla: three ways to find the compute-optimal frontier', 'p4-pretrain', [], ['c4', 'plan']),
  D('Designing an experiment under a fixed compute budget', 'p4-pretrain', [], ['c4', 'make', 'A small compute budget and 4–5 model sizes that fit it']),
  D('Learning-rate schedules, and why they matter for scaling fits', 'p4-pretrain', [], ['c4', 'make', 'Train each size to the same compute with a cosine schedule']),
  D('Fitting power laws to your own runs', 'p4-pretrain', [], ['c4', 'make', 'Final loss against size; find the optimum']),
  D('Long context: attention sinks and extending the window', 'p4-efficient', [], ['c4', 'make', 'Compare your tokens-per-parameter with Chinchilla\'s roughly 20']),
  D('What a tiny-scale reproduction can and cannot show', 'p4-pretrain', [], ['c4', 'test']),
  FRONTIER(),
  REVIEW('p4-pretrain', 'c4'),
  BOSS('p4-pretrain'),

  /* ===================== Part 5 — making models smart ===================== */
  D('From base model to assistant: what supervised fine-tuning changes', 'p5-sft', [], ['a13', 'plan']),
  D('Chat templates, special tokens and loss masking', 'p5-sft', [], ['a13', 'make', 'A small open model and an instruction dataset; measure the base model first']),
  D('LoRA: training a few million parameters instead of billions', 'p5-sft', ['lora'], ['a13', 'make', 'Fine-tune with LoRA, or QLoRA on a free GPU']),
  D('QLoRA: 4-bit base weights, full-precision adapters', 'p5-sft', [], ['a13', 'make', 'Evaluate before and after on the same held-out prompts']),
  D('Synthetic data and distillation from bigger models', 'p5-sft', ['distill'], ['a13', 'test', 'Publish the adapter on Hugging Face with a card and your numbers']),
  D('Evaluating chat models: benchmarks, win rates and LLM-as-judge', 'p5-pref', [], ['a13', 'ship']),
  FRONTIER(),
  D('RL basics: agents, environments, rewards and returns', 'p5-rl', ['returns'], ['a14', 'plan']),
  D('Value functions and the Bellman equation', 'p5-rl', [], ['a14', 'make', 'REINFORCE on CartPole with Gymnasium']),
  D('Policy gradients: REINFORCE and the variance problem', 'p5-rl', ['pgrad'], ['a14', 'make', 'A value baseline; plot average return per episode']),
  D('PPO: clipping the update so learning stays stable', 'p5-rl', [], ['a14', 'make', 'PPO, on the same chart as REINFORCE']),
  D('Reward models: learning what people prefer', 'p5-pref', ['bradley'], ['a14', 'test']),
  D('RLHF: the InstructGPT recipe, end to end', 'p5-pref', [], ['a14', 'ship']),
  FRONTIER(),
  D('DPO: preference tuning without a separate reward model', 'p5-pref', ['dpo'], ['a15', 'plan']),
  D('Constitutional AI and feedback from AI instead of people', 'p5-pref', [], ['a15', 'make', 'A preference dataset for your fine-tuned model']),
  D('Reward hacking: optimising the measure, not the goal', 'p5-pref', [], ['a15', 'make', 'DPO with TRL, starting from your SFT model']),
  D('Chain of thought, self-consistency and best-of-n', 'p5-reason', ['bestofn'], ['a15', 'make', 'Judge 50 prompts, SFT against DPO; report the win rate']),
  D('Test-time compute: more thinking for harder problems', 'p5-reason', [], ['a15', 'test']),
  D('GRPO: group-relative advantages from verifiable rewards', 'p5-reason', ['grpo'], ['a15', 'ship']),
  FRONTIER(),
  D('Reading DeepSeek-R1: reasoning from pure RL, and the "aha moment"', 'p5-reason', [], ['c5', 'plan']),
  D('Verifiable rewards: checking answers instead of judging them', 'p5-reason', [], ['c5', 'make', 'GRPO on a small model with GSM8K and an exact-answer reward']),
  D('Distilling reasoning into smaller models', 'p5-reason', [], ['c5', 'make', 'Train; log accuracy and average response length throughout']),
  D('Measuring reasoning honestly: pass@k and contamination', 'p5-reason', [], ['c5', 'make', 'Held-out accuracy before and after, with error bars']),
  D('What stops reasoning RL working at small scale', 'p5-reason', [], ['c5', 'make', 'Publish the model on Hugging Face with its card']),
  D('Writing it up: curves, examples and failures', 'p5-reason', [], ['c5', 'test']),
  FRONTIER(),
  REVIEW('p5-reason', 'c5'),
  BOSS('p5-reason'),

  /* ======================== Part 6 — building with AI ===================== */
  D('Prompting that works: structure, examples and asking for reasoning', 'p6-prompt', ['tokens'], ['a16', 'plan']),
  D('Embeddings and vector search', 'p6-rag', ['cosine'], ['a16', 'make', 'Chunk, embed and index your own documents; answer questions from them']),
  D('Chunking, hybrid search and reranking', 'p6-rag', ['chunks'], ['a16', 'test', '30 questions with known answers: recall@5 and accuracy as you add hybrid search and a reranker']),
  D('Measuring retrieval: recall@k and MRR', 'p6-rag', ['mrr'], ['a16', 'ship']),
  D('Structured output and function calling', 'p6-agents', [], ['a17', 'plan']),
  D('Agents: think, act, observe — and when not to use one', 'p6-agents', [], ['a17', 'make', 'An MCP server exposing two or three real tools']),
  FRONTIER(),
  D('MCP: giving any model the same tools', 'p6-agents', [], ['a17', 'test', 'An agent on 20 tasks that need the tools: success rate and failure types']),
  D('AI coding tools: how agentic coding works, and reviewing what it writes', 'p6-prompt', [], ['a17', 'ship']),
  D('Evals first: error analysis and golden sets', 'p6-evals', ['judge'], ['a18', 'plan']),
  D('LLM-as-judge: how to use it, and how it fails', 'p6-evals', [], ['a18', 'make', 'An eval harness: a golden set, exact checks and an LLM judge']),
  D('Prompt injection and guardrails', 'p6-agents', [], ['a18', 'test', 'Run it in GitHub Actions on every push; measure judge agreement with your labels']),
  D('Agent benchmarks: SWE-bench and what they really measure', 'p6-evals', [], ['a18', 'ship']),
  FRONTIER(),
  D('Serving: batching, paged attention and vLLM', 'p6-serve', ['latency'], ['a19', 'plan']),
  D('Quantization: int8, 4-bit, GPTQ and AWQ', 'p6-serve', ['quant'], ['a19', 'make', 'Serve an open model with vLLM or llama.cpp; measure tokens/s and p95 latency']),
  D('Speculative decoding: guessing ahead with a small model', 'p6-serve', ['specdec'], ['a19', 'make', 'Quantize it; measure speed and quality again']),
  D('Cost: tokens, GPUs and the price per million', 'p6-serve', [], ['a19', 'make', 'Your cost per million tokens against an API\'s']),
  D('MLOps: tracking experiments, versioning data and models', 'p6-serve', [], ['a19', 'test', 'Put the demo up as a Hugging Face Space']),
  D('Monitoring in production: drift, feedback and incidents', 'p6-serve', [], ['a19', 'ship']),
  FRONTIER(),
  D('Reading ReAct: reasoning traces plus actions', 'p6-agents', [], ['c6', 'plan']),
  D('Multi-agent systems: when splitting the work helps', 'p6-agents', [], ['c6', 'make', 'Act-only, chain-of-thought and ReAct agents on HotpotQA with an open model']),
  D('Memory for agents: what to keep and what to retrieve', 'p6-agents', [], ['c6', 'make', 'Run all three on the same 100 questions']),
  D('Comparing agents fairly: same model, same budget', 'p6-evals', [], ['c6', 'make', 'Exact-match accuracy with confidence intervals']),
  D('Failure analysis: sorting what went wrong', 'p6-evals', [], ['c6', 'make', '30 failures of each, categorised']),
  D('Shipping AI products: latency, cost and trust', 'p6-prompt', [], ['c6', 'test']),
  FRONTIER(),
  REVIEW('p6-agents', 'c6'),
  BOSS('p6-agents'),

  /* ========================== Part 7 — beyond text ======================== */
  D('Vision transformers: images as sequences of patches', 'p7-vision', ['patches'], ['a20', 'plan']),
  D('Contrastive learning and CLIP: one space for images and text', 'p7-vision', ['infonce'], ['a20', 'make', 'Zero-shot classification with CLIP on a public dataset; report accuracy']),
  D('Zero-shot classification, and its limits', 'p7-vision', [], ['a20', 'make', 'Text-to-image search over the dataset']),
  D('Detection and segmentation: boxes, masks and Segment Anything', 'p7-vision', ['iou'], ['a20', 'make', 'Put it up as a Hugging Face Space']),
  D('Vision-language models: an image encoder bolted onto an LLM', 'p7-multi', [], ['a20', 'test']),
  D('Self-supervised vision: learning without labels', 'p7-vision', [], ['a20', 'ship']),
  FRONTIER(),
  D('Diffusion: adding noise, and learning to remove it', 'p7-gen', ['ddpm'], ['a21', 'plan']),
  D('The DDPM objective: predicting the noise', 'p7-gen', [], ['a21', 'make', 'DDPM on MNIST: the schedule, a small U-Net and the sampler']),
  D('Sampling faster: DDIM and fewer steps', 'p7-gen', [], ['a21', 'make', 'Class conditioning and classifier-free guidance']),
  D('Guidance: classifier-free guidance and conditioning', 'p7-gen', ['cfg'], ['a21', 'make', 'A flow-matching version; compare samples and steps']),
  D('Latent diffusion: diffusing in a compressed space', 'p7-gen', ['latent'], ['a21', 'test']),
  D('Flow matching: straight paths from noise to data', 'p7-gen', [], ['a21', 'ship']),
  FRONTIER(),
  D('Audio as data: waveforms, spectrograms and mel scales', 'p7-audio', ['spectro'], ['a22', 'plan']),
  D('Speech recognition: Whisper and weak supervision at scale', 'p7-audio', [], ['a22', 'make', 'Whisper into a language model into text-to-speech']),
  D('Text-to-speech and voice', 'p7-audio', [], ['a22', 'make', 'Word error rate on 20 of your own recordings']),
  D('Video generation and world models', 'p7-gen', [], ['a22', 'make', 'End-to-end latency, measured, then cut']),
  D('Robot learning: imitation, action chunking and diffusion policies', 'p7-multi', ['chunk'], ['a22', 'test']),
  D('Vision-language-action models: RT-2 and OpenVLA', 'p7-multi', [], ['a22', 'ship']),
  FRONTIER(),
  D('Reading Diffusion Policy: actions as a denoising process', 'p7-multi', [], ['c7', 'plan']),
  D('Push-T: the task, and how success is measured', 'p7-multi', [], ['c7', 'make', 'LeRobot with the Push-T simulation and its dataset']),
  D('Training policies: observation horizons and action chunks', 'p7-multi', [], ['c7', 'make', 'Train a diffusion policy']),
  D('Evaluating policies: success rate over many rollouts', 'p7-multi', [], ['c7', 'make', 'At least 50 rollouts, with videos of success and failure']),
  D('Sim-to-real: why policies break on real robots', 'p7-multi', [], ['c7', 'make', 'Compare with the paper and with an ACT baseline']),
  D('Writing up a robotics reproduction', 'p7-multi', [], ['c7', 'test']),
  FRONTIER(),
  REVIEW('p7-multi', 'c7'),
  BOSS('p7-multi'),

  /* =================== Part 8 — the frontier, safely ====================== */
  D('Mechanistic interpretability: finding the algorithm inside', 'p8-interp', [], ['a24', 'plan']),
  D('TransformerLens: hooks, caches and the residual stream', 'p8-interp', [], ['a24', 'make', 'GPT-2 small in TransformerLens, reproducing the indirect-object behaviour']),
  D('Activation patching: which parts of the model matter', 'p8-interp', ['patching'], ['a24', 'test', 'Patch each head; plot which restore the answer']),
  D('Circuits: the indirect-object-identification example', 'p8-interp', [], ['a24', 'ship']),
  D('Superposition: more features than neurons', 'p8-interp', ['sae'], ['a25', 'plan']),
  D('Sparse autoencoders: pulling features out of superposition', 'p8-interp', [], ['a25', 'make', 'An SAE on one layer of a small model\'s residual stream']),
  FRONTIER(),
  D('Probing: is the information linearly there?', 'p8-steer', ['probe'], ['a25', 'test', 'Report L0 and reconstruction loss; label ten features with examples']),
  D('Steering: adding a direction to change behaviour', 'p8-steer', ['steer'], ['a25', 'ship']),
  D('Reward hacking and specification gaming', 'p8-safety', ['goodhart'], ['a26', 'plan']),
  D('Jailbreaks: why safety training fails', 'p8-safety', [], ['a26', 'make', 'An attack suite — jailbreaks and injections — against your own fine-tuned model']),
  D('Prompt injection: when the data gives the orders', 'p8-safety', ['asr'], ['a26', 'test', 'Attack success rate, a defence, and the rate again']),
  D('Red-teaming with models', 'p8-safety', [], ['a26', 'ship']),
  FRONTIER(),
  D('Evaluating dangerous capabilities, and why it is hard', 'p8-safety', [], ['a27', 'plan']),
  D('Scalable oversight: checking work you cannot check yourself', 'p8-safety', [], ['a27', 'make', 'Rewrite your best five READMEs: a figure first, the numbers, what failed']),
  D('Statistics for AI claims: is the improvement real?', 'p8-research', ['stats'], ['a27', 'make', 'A profile README linking them, and your Hugging Face work']),
  D('Reading papers fast: the three-pass method', 'p8-research', ['papers'], ['a27', 'make', 'One short post about a result you reproduced']),
  D('Choosing a research question you can actually answer', 'p8-research', [], ['a27', 'test']),
  D('Where AI is going, and where you fit', 'p8-research', [], ['a27', 'ship']),
  FRONTIER(),
  D('Reading "Discovering latent knowledge without supervision"', 'p8-steer', [], ['c8', 'plan']),
  D('Contrast pairs and consistency: finding truth with no labels', 'p8-steer', [], ['c8', 'make', 'Contrast pairs from a true/false dataset, and hidden states from a small model']),
  D('Supervised probes as the ceiling to compare against', 'p8-steer', [], ['c8', 'make', 'Train CCS; compare with a supervised probe and with zero-shot prompting']),
  D('When unsupervised methods find the wrong thing', 'p8-steer', [], ['c8', 'make', 'Test whether the direction transfers to another dataset']),
  D('Responsible research: dual use and disclosure', 'p8-safety', [], ['c8', 'make', 'Accuracies with error bars across layers']),
  D('Publishing research: the write-up, the code and what you would do next', 'p8-research', [], ['c8', 'test']),
  FRONTIER(),
  REVIEW('p8-steer', 'c8'),
  BOSS('p8-research'),
];

/* ---------------------------------- steps --------------------------------- */

function withSteps(days) {
  const runs = {};
  days.forEach((d, i) => { if (d.build) (runs[d.build[0]] ||= []).push(i); });
  for (const [id, idx] of Object.entries(runs)) {
    idx.forEach((i, k) => {
      const [, kind, arg] = days[i].build;
      days[i] = { ...days[i], build: { id, kind, step: k + 1, of: idx.length, text: typeof arg === 'string' ? arg : null } };
    });
  }
  return days;
}

export const MISSIONS = numberDays(withSteps(DAYS));
export const TOTAL_MISSIONS = MISSIONS.length;
export const PLAN_DAYS = MISSIONS.length;
export const missionAt = n => MISSIONS[Math.max(1, Math.min(MISSIONS.length, n)) - 1];

/** What a build step asks of you, in a line. */
export function stepLine(step, build) {
  if (!step) return '';
  if (step.text) return step.text;
  if (step.kind === 'plan') return `Plan it: read the task, choose your data and compute (${build?.compute === 'cheap' ? 'this one needs a rented GPU' : 'free is enough'}), and start a public repo with a README that says what you will measure. Push.`;
  if (step.kind === 'make') return 'Keep building. Push what works today, even if it is half.';
  if (step.kind === 'test') return 'Measure it properly: put the numbers, a figure and a "What didn\'t work" section in the README. Push.';
  return `Ship it: ${build?.verify === 'hf' ? 'publish it on Hugging Face with a card, then press Verify.' : 'push the final README with the numbers, then press Verify.'}`;
}
export const STEP_NAMES = { plan: 'Plan', make: 'Make', test: 'Test', ship: 'Ship' };
export const stepName = step => STEP_NAMES[step.kind];
