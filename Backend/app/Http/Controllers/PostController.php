<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Post;

class PostController extends Controller
{
    public function index()
    {
        return Post::with('user')->latest()->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'content' => 'required|max:500'
        ]);

        return Post::create([
            'user_id' => auth()->id(),
            'content' => $request->content
        ]);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'content' => 'required|max:500'
        ]);

        $post = Post::findOrFail($id);

        // Solo dueño del post
        if (auth()->id() != $post->user_id) {
            return response()->json([
                'message' => 'Forbidden'
            ], 403);
        }

        $post->update([
            'content' => $request->content
        ]);

        return response()->json($post);
    }

    public function destroy($id)
    {
        $post = Post::findOrFail($id);

        // Solo dueño del post
        if (auth()->id() != $post->user_id) {
            return response()->json([
                'message' => 'Forbidden'
            ], 403);
        }

        $post->delete();

        return response()->json([
            'message' => 'Deleted'
        ]);
    }
}