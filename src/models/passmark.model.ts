interface Entry {
  name: string;
  date: string;
}

export interface Cpu extends Entry {
  cat: string;
  socket: string;
  cpumark: string;
}

export interface Gpu extends Entry {
  cat: string;
  memSize: string;
  g3d: string;
}

export interface Drive extends Entry {
  type: string;
  size: string;
  diskmark: string;
}

export interface PassmarkResponse<T> {
  data: T[];
}
