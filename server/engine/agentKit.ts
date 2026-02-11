import { SolanaAgentKit } from "solana-agent-kit";
import {
  Keypair,
  Transaction,
  TransactionInstruction,
  PublicKey,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import bs58 from "bs58";

const MEMO_PROGRAM_ID = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");

let agentKit: SolanaAgentKit | null = null;

function getOrCreateKeypair(): Keypair {
  const raw = process.env.SOLANA_KEYPAIR_JSON;
  if (raw) {
    try {
      const secretKey = new Uint8Array(JSON.parse(raw));
      return Keypair.fromSecretKey(secretKey);
    } catch {
      console.warn("[agentKit] Failed to parse SOLANA_KEYPAIR_JSON, generating ephemeral keypair");
    }
  }
  const kp = Keypair.generate();
  console.log("[agentKit] Generated ephemeral keypair:", kp.publicKey.toBase58());
  return kp;
}

export function initAgentKit(): SolanaAgentKit {
  if (agentKit) return agentKit;

  const kp = getOrCreateKeypair();
  const rpcUrl = process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com";
  const openaiKey = process.env.OPENAI_API_KEY || "";

  const privateKeyBase58 = bs58.encode(kp.secretKey);

  agentKit = new SolanaAgentKit(privateKeyBase58, rpcUrl, openaiKey);
  console.log("[agentKit] SolanaAgentKit initialized, wallet:", agentKit.wallet_address.toBase58());

  (async () => {
    try {
      const balance = await agentKit!.connection.getBalance(agentKit!.wallet_address);
      if (balance < 10_000_000) {
        console.log("[agentKit] Requesting devnet airdrop for memo fees...");
        const sig = await agentKit!.connection.requestAirdrop(agentKit!.wallet_address, 1_000_000_000);
        await agentKit!.connection.confirmTransaction(sig, "confirmed");
        console.log("[agentKit] Airdrop confirmed");
      }
    } catch (err: any) {
      console.warn("[agentKit] Airdrop failed (non-critical):", err.message);
    }
  })();

  return agentKit;
}

export function getAgentPublicKey(): string {
  const kit = initAgentKit();
  return kit.wallet_address.toBase58();
}

export async function agentSendMemo(text: string): Promise<string> {
  try {
    const kit = initAgentKit();
    const instruction = new TransactionInstruction({
      keys: [{ pubkey: kit.wallet_address, isSigner: true, isWritable: false }],
      programId: MEMO_PROGRAM_ID,
      data: Buffer.from(text, "utf-8"),
    });

    const tx = new Transaction().add(instruction);
    const sig = await sendAndConfirmTransaction(kit.connection, tx, [kit.wallet], {
      commitment: "confirmed",
    });
    console.log("[agentKit] Memo sent:", sig);
    return sig;
  } catch (err: any) {
    console.error("[agentKit] Failed to send memo tx:", err.message || err);
    return "N/A";
  }
}
