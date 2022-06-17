import {
  TypedDatabaseTransaction,
  GanacheRawBlockTransactionMetaData
} from "metaglobe-transaction";
import { digest, encodeLength, encodeRange, encode } from "@ganache/rlp";
import { uintToBuffer } from "@ganache/utils";

export type GanacheRawBlockExtras = [
  totalDifficulty: Buffer,
  transactionMetaData: GanacheRawBlockTransactionMetaData[],
  metaglobeRawBlockSize: Buffer
];
export type MetaglobeRawBlockHeader = [
  parentHash: Buffer,
  sha3Uncles: Buffer,
  miner: Buffer,
  stateRoot: Buffer,
  transactionsRoot: Buffer,
  receiptsRoot: Buffer,
  logsBloom: Buffer,
  difficulty: Buffer,
  number: Buffer,
  gasLimit: Buffer,
  gasUsed: Buffer,
  timestamp: Buffer,
  extraData: Buffer,
  mixHash: Buffer,
  nonce: Buffer,
  baseFeePerGas?: Buffer
];
export type MetaglobeRawBlock = [
  rawHeader: MetaglobeRawBlockHeader,
  rawTransactions: TypedDatabaseTransaction[],
  uncles: []
];
type Head<T extends any[]> = T extends [...infer Head, any] ? Head : any[];

export type GanacheRawBlock = [...MetaglobeRawBlock, ...GanacheRawBlockExtras];
export function serialize(
  raw: Head<GanacheRawBlock>
): { serialized: Buffer; size: number } {
  const serializedStart = encodeRange(raw, 0, 3);
  const serializedLength = serializedStart.length;
  const metaglobeRawBlockSize = encodeLength(serializedLength, 192).length;
  const size = metaglobeRawBlockSize + serializedLength;
  const middle = encodeRange(raw, 3, 2);
  const ending = encode(uintToBuffer(size));
  return {
    serialized: digest(
      [serializedStart.output, middle.output, [ending]],
      serializedLength + middle.length + ending.length
    ),
    size
  };
}
