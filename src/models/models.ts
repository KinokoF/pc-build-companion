type Month = 'Jan' | 'Feb' | 'Mar' | 'Apr' | 'May' | 'Jun' | 'Jul' | 'Aug' | 'Sep' | 'Oct' | 'Nov' | 'Dec'

export type NA = 'NA'
export type Numeric = `${number}`
export type Formatted = Numeric | `${number},${string}`
export type Count = number | Numeric
export type Price = `$${Formatted}${'' | '*'}`
export type MonthYear = `${Month} ${number}`
export type Csv<T extends string, U extends string = T> = T extends unknown ? T | `${T}, ${Csv<Exclude<U, T>>}` : never

export type CpuCategory = 'Desktop' | 'Laptop' | 'Server' | 'Mobile/Embedded'
export type GpuCategory = 'Desktop' | 'Mobile' | 'Workstation'

export interface Dataset<T> {
  data: T[]
}

export interface Entry {
  id: Numeric
  name: string
  price: NA | Price
  value: NA | Numeric
  date: MonthYear
  samples: Count
  href: `${string}&amp;id=${number}`
}

interface Ranked {
  rank: number
  output: true
}

interface Unranked {
  rank: 'Insufficient data'
  output: false
}

interface Powered {
  tdp: NA | Numeric
  powerPerf: NA | Formatted
}

export interface Cpu extends Entry, Powered, Ranked {
  cpumark: Formatted
  thread: NA | Formatted
  threadValue: NA | Numeric
  socket: string
  cat: 'Unknown' | Csv<CpuCategory>
  speed: NA | Numeric | ''
  turbo: NA | Numeric
  cpuCount: Count
  cores: Numeric
  logicals: Numeric
  secondaryCores: Count
  secondaryLogicals: Count
  family?: Numeric
}

interface GpuSpecs extends Entry, Powered {
  g3d: Formatted
  g2d: Formatted
  cat: 'Unknown' | Csv<GpuCategory>
  bus: string
  memSize: NA | `${number} MB`
  coreClk: NA | `${string} MHz`
  memClk: NA | `${string} MHz`
}

export type Gpu = GpuSpecs & (Ranked | Unranked)

export interface Drive extends Entry, Ranked {
  size: `${number} ${'MB' | 'GB' | 'TB'}`
  diskmark: Formatted
  type: 'SSD' | 'HDD'
}
