import { supabase } from '@/utils/supabase';
import { Doubt, DoubtReply } from '@/types/database.types';

// Get all doubts for the current user
export async function getUserDoubts() {
  try {
    // Get the current user's ID
    const { data: authData, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      throw authError;
    }
    
    const userId = authData.user?.id;
    
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    // Query doubts for the current user
    const { data, error } = await supabase
      .from('doubts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data as Doubt[];
  } catch (error) {
    console.error('Error fetching user doubts:', error);
    throw error;
  }
}

// Get a single doubt by ID with its replies
export async function getDoubtWithReplies(doubtId: string) {
  try {
    // Get the doubt
    const { data: doubt, error: doubtError } = await supabase
      .from('doubts')
      .select('*')
      .eq('id', doubtId)
      .single();

    if (doubtError) {
      throw doubtError;
    }

    // Get the replies
    const { data: replies, error: repliesError } = await supabase
      .from('doubt_replies')
      .select('*')
      .eq('doubt_id', doubtId)
      .order('created_at', { ascending: true });

    if (repliesError) {
      throw repliesError;
    }

    return {
      doubt: doubt as Doubt,
      replies: replies as DoubtReply[]
    };
  } catch (error) {
    console.error('Error fetching doubt with replies:', error);
    throw error;
  }
}

// Create a new doubt
export async function createDoubt(
  title: string,
  description: string,
  courseId?: string,
  lectureId?: string
) {
  try {
    // Get the current user's ID
    const { data: authData, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      throw authError;
    }
    
    const userId = authData.user?.id;
    
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    const { data, error } = await supabase
      .from('doubts')
      .insert({
        title,
        description,
        status: 'pending',
        course_id: courseId,
        lecture_id: lectureId,
        user_id: userId
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data as Doubt;
  } catch (error) {
    console.error('Error creating doubt:', error);
    throw error;
  }
}

// Add a reply to a doubt
export async function addDoubtReply(doubtId: string, content: string, isTeacher: boolean = false) {
  try {
    // Get the current user's ID
    const { data: authData, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      throw authError;
    }
    
    const userId = authData.user?.id;
    
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    const { data, error } = await supabase
      .from('doubt_replies')
      .insert({
        doubt_id: doubtId,
        content,
        is_teacher: isTeacher,
        user_id: userId
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // If this is a teacher reply, update the doubt status to 'answered'
    if (isTeacher) {
      await supabase
        .from('doubts')
        .update({ status: 'answered' })
        .eq('id', doubtId);
    }

    return data as DoubtReply;
  } catch (error) {
    console.error('Error adding doubt reply:', error);
    throw error;
  }
}

// Mark a doubt as resolved
export async function markDoubtAsResolved(doubtId: string) {
  try {
    const { data, error } = await supabase
      .from('doubts')
      .update({ status: 'resolved' })
      .eq('id', doubtId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data as Doubt;
  } catch (error) {
    console.error('Error marking doubt as resolved:', error);
    throw error;
  }
}

// Format date for display
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}