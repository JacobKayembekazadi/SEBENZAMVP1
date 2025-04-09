
// Mock data
export const folders = [
  { id: 1, name: "Client Files", count: 24 },
  { id: 2, name: "Case Documents", count: 18 },
  { id: 3, name: "Templates", count: 7 },
  { id: 4, name: "Contracts", count: 12 },
  { id: 5, name: "Evidence", count: 5 },
];

export const files = [
  { 
    id: 1, 
    name: "Smith Contract.pdf", 
    type: "pdf", 
    size: "2.4 MB", 
    modified: "Today, 2:30 PM", 
    client: "Smith & Co", 
    case: "Smith v. Jones",
    tags: ["contract", "confidential"]
  },
  { 
    id: 2, 
    name: "Case Brief.docx", 
    type: "document", 
    size: "843 KB", 
    modified: "Yesterday", 
    client: "Johnson LLC", 
    case: "Johnson v. State",
    tags: ["brief", "draft"]
  },
  { 
    id: 3, 
    name: "Evidence Photo.jpg", 
    type: "image", 
    size: "3.1 MB", 
    modified: "Jun 12, 2023", 
    client: "Williams Inc", 
    case: "Williams v. Davis",
    tags: ["evidence", "photo"]
  },
  { 
    id: 4, 
    name: "Witness Statement.mp3", 
    type: "audio", 
    size: "12.8 MB", 
    modified: "Jun 10, 2023", 
    client: "Davis Corp", 
    case: "Davis v. Miller",
    tags: ["interview", "confidential"]
  },
  { 
    id: 5, 
    name: "Client Agreement.pdf", 
    type: "pdf", 
    size: "1.2 MB", 
    modified: "Jun 8, 2023", 
    client: "Smith & Co", 
    case: "Smith v. Jones",
    tags: ["agreement", "signed"]
  },
];

export type Folder = typeof folders[0];
export type FileData = typeof files[0];
