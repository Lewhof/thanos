import DefaultNode from './DefaultNode'
import InputNode from './InputNode'
import OutputNode from './OutputNode'
import DecisionNode from './DecisionNode'
import ProcessNode from './ProcessNode'
import NoteNode from './NoteNode'
import GroupNode from './GroupNode'
import DatabaseNode from './DatabaseNode'
import CloudNode from './CloudNode'
import ActorNode from './ActorNode'
import CommentNode from './CommentNode'

export const nodeTypes = {
  default: DefaultNode,
  input: InputNode,
  output: OutputNode,
  decision: DecisionNode,
  process: ProcessNode,
  note: NoteNode,
  group: GroupNode,
  database: DatabaseNode,
  cloud: CloudNode,
  actor: ActorNode,
  comment: CommentNode,
} as const
