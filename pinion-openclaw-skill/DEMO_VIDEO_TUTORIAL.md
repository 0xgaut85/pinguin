# Pinion OS — 30-Second Demo Video (Claude Plugin)

**Target audience:** Developers who use Claude Code / OpenClaw and want on-chain tools on Base.  
**Runtime:** ~30 seconds  
**Format:** Screen recording + voiceover

---

## Prerequisites (Before Recording)

### 1. Install OpenClaw (if not already)

**Mac / Linux / WSL:**
```bash
curl -fsSL https://openclaw.bot/install.sh | bash
# or:
npm install -g openclaw@latest
openclaw onboard --install-daemon
```

**Windows (PowerShell):**
```powershell
iwr -useb https://openclaw.ai/install.ps1 | iex
```

Verify:
```bash
openclaw doctor
openclaw status
```

### 2. Install Claude Code

```bash
curl -fsSL https://claude.ai/install.sh | bash
claude --version
```

Sign in once: run `claude`, follow browser link, sign in with Claude Max account, then `/exit`.

### 3. Install Pinion Chain Intel Plugin

```bash
# From this repo
cp -r pinion-openclaw-skill ~/.openclaw/workspace/skills/pinion-chain-intel

# Or from GitHub
git clone https://github.com/chu2bard/pinion-os.git
cp -r pinion-os/pinion-openclaw-skill ~/.openclaw/workspace/skills/pinion-chain-intel
```

Restart OpenClaw (or start a new Claude session) so it picks up the skill.

### 4. Fund Your Agent Wallet

The skills cost **$0.01 USDC per call** via x402 on Base. Ensure:

- Your OpenClaw agent wallet has **ETH** (gas) and **USDC** on Base mainnet  
- Or use the `fund` skill: ask Claude to check your address and follow the instructions

---

## Recording Setup

- **Screen:** Terminal with Claude Code + a clean font (e.g. JetBrains Mono, Fira Code, 16–18pt)
- **Zoom:** ~120% so chat + output are readable
- **Tool:** OBS, Loom, or built-in screen recorder
- **Resolution:** 1920×1080 or higher

---

## Script & Timing (~30 seconds)

### 0:00 – 0:05 — Hook

**Say:**
> "Give Claude on-chain superpowers in 30 seconds. Pinion OS adds eight Base skills—balance, price, chat, trade—paywalled at a penny per call via x402."

**Show:** Brief title card or pinionos.com logo if you have one.

---

### 0:05 – 0:12 — Setup (fast montage)

**Say:**
> "Install OpenClaw, then drop the Pinion Chain Intel skill into your workspace. Restart, and Claude gets the tools."

**Show (speed up if needed):**
1. `openclaw status` or `openclaw doctor`
2. `ls ~/.openclaw/workspace/skills/` showing `pinion-chain-intel`
3. Start `claude` in a project directory

---

### 0:12 – 0:25 — Live demo (2–3 skills)

**Say:**
> "Ask for the ETH price... check any wallet balance... or chat with the Pinion agent. Each call is one USDC micropayment on Base."

**Show (pick 2–3):**

1. **Price:**
   ```
   What's the current ETH price on Base?
   ```

2. **Balance:**
   ```
   Check the balance of 0x101Cd32b9bEEE93845Ead7Bc604a5F1873330acf
   ```

3. **Chat:**
   ```
   Ask the Pinion agent: what is x402?
   ```

Let the responses appear on screen so viewers see the JSON and natural-language output.

---

### 0:25 – 0:30 — CTA

**Say:**
> "Eight skills. A penny a call. Base. Get it at pinionos.com."

**Show:** Final frame with `pinionos.com` and GitHub link.

---

## Alternative Narration (Shorter / Different Tone)

**Tight (30 sec):**

1. *"Claude can read Base chain data—prices, balances, trades—but you need the tools."*
2. *"Pinion OS ships eight skills as an OpenClaw plugin. A penny per call, paid in USDC on Base with x402."*
3. *"Copy the skill folder, restart Claude, and ask for an ETH price or any wallet balance. That’s it."*
4. *"pinionos.com — link in the description."*

---

## What to Avoid

- Don’t explain x402 in detail; mention it briefly (“paid with x402”).
- Don’t demo all eight skills; 2–3 is enough.
- Don’t show wallet setup or payment signing unless it’s central to your story.
- Don’t spend time on `npm install pinion-os`; focus on the plugin flow.

---

## One-Liner Summary for Thumbnail / Description

> **"8 Base chain skills for Claude. $0.01 per call. OpenClaw plugin."**

---

## Links to Include

- **Site:** https://pinionos.com  
- **GitHub:** https://github.com/chu2bard/pinion-os  
- **Skill server:** https://pinionos.com/skill  
- **Free catalog:** `GET https://pinionos.com/skill/catalog`
