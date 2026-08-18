<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Category;
use App\Models\DocumentTemplate;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class DocumentTemplateController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $templates = DocumentTemplate::with(['category', 'user'])
            ->latest()
            ->paginate(15);

        $categories = Category::orderBy('name')->get(['id', 'name', 'code']);

        return Inertia::render('templates/index', [
            'templates' => $templates,
            'categories' => $categories,
            'canManage' => $user->isAdmin(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();
        if (! $user->isAdmin()) {
            abort(403, 'Unauthorized');
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'description' => 'nullable|string',
            'file' => 'required|file|max:25600', // max 25MB
        ]);

        $file = $request->file('file');
        $originalName = $file->getClientOriginalName();
        $fileSize = $file->getSize();
        $path = $file->store('templates', 'public');

        $template = DocumentTemplate::create([
            'user_id' => $user->id,
            'category_id' => $request->category_id,
            'name' => $request->name,
            'description' => $request->description,
            'file_name' => $originalName,
            'file_path' => $path,
            'file_size' => $fileSize,
        ]);

        AuditLog::log(
            'TEMPLATE_UPLOADED',
            "Admin uploaded document template: \"{$template->name}\".",
            'DocumentTemplate',
            $template->id,
            $user
        );

        return back()->with('success', 'Document template uploaded successfully!');
    }

    public function download(DocumentTemplate $template)
    {
        $filePath = storage_path('app/public/'.$template->file_path);

        if (file_exists($filePath)) {
            return response()->download($filePath, $template->file_name);
        }

        // Fallback for seeded templates
        return response()->streamDownload(function () use ($template) {
            echo "Official DILG Template: {$template->name}\nCategory: {$template->category?->name}\nDescription: {$template->description}\n\n[Form fields and formatting for {$template->file_name}]";
        }, $template->file_name, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ]);
    }

    public function destroy(Request $request, DocumentTemplate $template): RedirectResponse
    {
        $user = $request->user();
        if (! $user->isAdmin()) {
            abort(403, 'Unauthorized');
        }

        $name = $template->name;
        if (Storage::disk('public')->exists($template->file_path)) {
            Storage::disk('public')->delete($template->file_path);
        }

        $template->delete();

        AuditLog::log(
            'TEMPLATE_DELETED',
            "Admin deleted document template: \"{$name}\".",
            'DocumentTemplate',
            null,
            $user
        );

        return back()->with('success', 'Document template deleted successfully.');
    }
}
