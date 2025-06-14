import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquare, Plus, Edit, Trash2 } from 'lucide-react';
import { Client } from '@/lib/store';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface ClientNotesProps {
  client: Client;
  currentUser: string;
  onAddNote: (note: { content: string }) => void;
  onEditNote?: (noteId: string, content: string) => void;
  onDeleteNote?: (noteId: string) => void;
}

export function ClientNotes({ 
  client, 
  currentUser,
  onAddNote,
  onEditNote,
  onDeleteNote 
}: ClientNotesProps) {
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const handleAddNote = () => {
    if (newNoteContent.trim()) {
      onAddNote({ content: newNoteContent.trim() });
      setNewNoteContent('');
      setIsAddingNote(false);
    }
  };

  const handleEditNote = (noteId: string) => {
    if (editContent.trim() && onEditNote) {
      onEditNote(noteId, editContent.trim());
      setEditingNoteId(null);
      setEditContent('');
    }
  };

  const startEdit = (note: Client['notes'][0]) => {
    setEditingNoteId(note.id);
    setEditContent(note.content);
  };

  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Notes
          </CardTitle>
          <Button
            size="sm"
            onClick={() => setIsAddingNote(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Note
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-4">
            {client.notes.map((note) => (
              <div key={note.id} className="group relative">
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {getUserInitials(note.createdBy)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{note.createdBy}</span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(note.createdAt), 'MMM d, yyyy h:mm a')}
                        </span>
                      </div>
                      {note.createdBy === currentUser && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => startEdit(note)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          {onDeleteNote && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onDeleteNote(note.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                  </div>
                </div>
              </div>
            ))}
            
            {client.notes.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No notes yet. Add a note to keep track of important information.
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>

      {/* Add Note Dialog */}
      <Dialog open={isAddingNote} onOpenChange={setIsAddingNote}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Note</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              placeholder="Enter your note..."
              className="min-h-[150px]"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingNote(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddNote} disabled={!newNoteContent.trim()}>
              Add Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Note Dialog */}
      <Dialog open={!!editingNoteId} onOpenChange={() => setEditingNoteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Note</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="Enter your note..."
              className="min-h-[150px]"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingNoteId(null)}>
              Cancel
            </Button>
            <Button 
              onClick={() => editingNoteId && handleEditNote(editingNoteId)} 
              disabled={!editContent.trim()}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
} 