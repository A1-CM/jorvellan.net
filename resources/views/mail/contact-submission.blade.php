<h1>New Jorvellan website inquiry</h1>
<p><strong>Name:</strong> {{ $submission->name }}</p>
<p><strong>Email:</strong> <a href="mailto:{{ $submission->email }}">{{ $submission->email }}</a></p>
@if ($submission->company)<p><strong>Company:</strong> {{ $submission->company }}</p>@endif
@if ($submission->phone)<p><strong>Phone:</strong> {{ $submission->phone }}</p>@endif
@if ($submission->subject)<p><strong>Subject:</strong> {{ $submission->subject }}</p>@endif
<p><strong>Message:</strong></p>
<p>{!! nl2br(e($submission->message)) !!}</p>
<p>Submitted {{ $submission->created_at->timezone('UTC')->format('F j, Y H:i') }} UTC.</p>
