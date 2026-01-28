import { useState, useEffect, useCallback } from "react";
import { 
  Save, Trash2, FolderOpen, CloudRain, Calendar, Clock, 
  Download, Upload, MoreHorizontal, Pencil, Check, X 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { type RainfallDataPoint, type ParsedRainfallData } from "@/lib/rainfallParsers";

export interface SavedStormEvent {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  data: RainfallDataPoint[];
  metadata: ParsedRainfallData['metadata'];
  tags?: string[];
}

interface StormEventLibraryProps {
  currentData: ParsedRainfallData | null;
  onLoadEvent: (event: SavedStormEvent) => void;
}

const STORAGE_KEY = 'rainfall-storm-library';

export function StormEventLibrary({ currentData, onLoadEvent }: StormEventLibraryProps) {
  const [events, setEvents] = useState<SavedStormEvent[]>([]);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  
  // Form state for saving
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newTags, setNewTags] = useState('');

  // Load events from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setEvents(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load storm library:', error);
    }
  }, []);

  // Save events to localStorage
  const saveToStorage = useCallback((newEvents: SavedStormEvent[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newEvents));
      setEvents(newEvents);
    } catch (error) {
      console.error('Failed to save storm library:', error);
    }
  }, []);

  // Save current storm
  const handleSave = useCallback(() => {
    if (!currentData || !newName.trim()) return;

    const newEvent: SavedStormEvent = {
      id: `storm_${Date.now()}`,
      name: newName.trim(),
      description: newDescription.trim() || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      data: currentData.data,
      metadata: currentData.metadata,
      tags: newTags ? newTags.split(',').map(t => t.trim()).filter(Boolean) : undefined,
    };

    saveToStorage([newEvent, ...events]);
    setSaveDialogOpen(false);
    setNewName('');
    setNewDescription('');
    setNewTags('');
  }, [currentData, newName, newDescription, newTags, events, saveToStorage]);

  // Delete event
  const handleDelete = useCallback(() => {
    if (!eventToDelete) return;
    saveToStorage(events.filter(e => e.id !== eventToDelete));
    setEventToDelete(null);
    setDeleteDialogOpen(false);
  }, [eventToDelete, events, saveToStorage]);

  // Rename event
  const handleRename = useCallback((id: string) => {
    if (!editName.trim()) {
      setEditingId(null);
      return;
    }
    
    saveToStorage(events.map(e => 
      e.id === id 
        ? { ...e, name: editName.trim(), updatedAt: new Date().toISOString() }
        : e
    ));
    setEditingId(null);
  }, [editName, events, saveToStorage]);

  // Export library
  const handleExportLibrary = useCallback(() => {
    const blob = new Blob([JSON.stringify(events, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `storm-library-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [events]);

  // Import library
  const handleImportLibrary = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported)) {
          // Merge with existing, avoiding duplicates by ID
          const existingIds = new Set(events.map(e => e.id));
          const newEvents = imported.filter((e: SavedStormEvent) => !existingIds.has(e.id));
          saveToStorage([...newEvents, ...events]);
        }
      } catch (error) {
        console.error('Failed to import library:', error);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }, [events, saveToStorage]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <FolderOpen className="w-5 h-5" />
              Storm Event Library
            </CardTitle>
            <CardDescription>
              Save and manage your imported storm events
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {/* Save Current */}
            <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="default" 
                  size="sm" 
                  disabled={!currentData || currentData.data.length === 0}
                  className="gap-1"
                >
                  <Save className="w-4 h-4" />
                  Save Current
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Save Storm Event</DialogTitle>
                  <DialogDescription>
                    Save the current storm data to your local library
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="e.g., Hurricane Harvey - Houston 2017"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      placeholder="e.g., 48-hour rainfall record from gauge XYZ"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags (comma-separated)</Label>
                    <Input
                      id="tags"
                      value={newTags}
                      onChange={(e) => setNewTags(e.target.value)}
                      placeholder="e.g., historical, houston, 2017"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={!newName.trim()}>
                    Save Event
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Library Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExportLibrary} disabled={events.length === 0}>
                  <Download className="w-4 h-4 mr-2" />
                  Export Library
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <label className="cursor-pointer flex items-center">
                    <Upload className="w-4 h-4 mr-2" />
                    Import Library
                    <input
                      type="file"
                      className="hidden"
                      accept=".json"
                      onChange={handleImportLibrary}
                    />
                  </label>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CloudRain className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No saved storm events</p>
            <p className="text-sm">Import data and click "Save Current" to build your library</p>
          </div>
        ) : (
          <ScrollArea className="h-[300px]">
            <div className="space-y-2">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <CloudRain className="w-8 h-8 text-primary shrink-0" />
                  
                  <div className="flex-1 min-w-0">
                    {editingId === event.id ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="h-7"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleRename(event.id);
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                        />
                        <Button size="sm" variant="ghost" onClick={() => handleRename(event.id)}>
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <p className="font-medium truncate">{event.name}</p>
                        {event.description && (
                          <p className="text-sm text-muted-foreground truncate">{event.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(event.createdAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {((event.data[event.data.length - 1]?.time || 0) / 60).toFixed(1)}hr
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {event.metadata.totalDepth?.toFixed(2)} {event.metadata.units === 'mm' ? 'mm' : 'in'}
                          </Badge>
                        </div>
                      </>
                    )}
                  </div>

                  {editingId !== event.id && (
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onLoadEvent(event)}
                      >
                        Load
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="ghost">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                            setEditingId(event.id);
                            setEditName(event.name);
                          }}>
                            <Pencil className="w-4 h-4 mr-2" />
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              setEventToDelete(event.id);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Storm Event?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The storm event will be permanently removed from your library.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
