interface Item {
  titlePlain: string;
  location: string;
  url: string;
}

interface Group {
  items: Item[];
}

export interface IdealoResponse {
  groups: Group[];
}
