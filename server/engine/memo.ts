import {
  Transaction,
  TransactionInstruction,
  PublicKey,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { getConnection, getKeypair } from "./state";

const MEMO_PROGRAM_ID = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");

export async function sendMemo(text: string): Promise<string> {
  try {
    const kp = getKeypair();
    const conn = getConnection();
    const instruction = new TransactionInstruction({
      keys: [{ pubkey: kp.publicKey, isSigner: true, isWritable: false }],
      programId: MEMO_PROGRAM_ID,
      data: Buffer.from(text, "utf-8"),
    });

    const tx = new Transaction().add(instruction);
    const sig = await sendAndConfirmTransaction(conn, tx, [kp], {
      commitment: "confirmed",
    });
    return sig;
  } catch (err: any) {
    console.error("[memo] Failed to send memo tx:", err.message || err);
    return "N/A";
  }
}
