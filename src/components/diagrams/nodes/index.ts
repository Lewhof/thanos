import DefaultNode from './DefaultNode'
import InputNode from './InputNode'
import OutputNode from './OutputNode'
import DecisionNode from './DecisionNode'
import ProcessNode from './ProcessNode'
import NoteNode from './NoteNode'
import GroupNode from './GroupNode'

export const nodeTypes = {
  default: DefaultNode,
  input: InputNode,
  output: OutputNode,
  decision: DecisionNode,
  process: ProcessNode,
  note: NoteNode,
  group: GroupNode,
} as const
