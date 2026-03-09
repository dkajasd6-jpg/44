
package com.gss.safe

import android.net.Uri

enum class UserRole { Worker, Admin }

data class User(
    val id: String,
    val name: String,
    val role: UserRole,
    val email: String = ""
)

data class UploadedFile(
    val id: String,
    val name: String,
    val type: String,
    val size: Long,
    val uploadedAt: String,
    val uploadedBy: String,
    val url: Uri
)

data class SafetyReport(
    val id: String,
    val type: String,
    val date: String,
    val issue: String? = null,
    val action: String? = null,
    val content: String? = null,
    val imageUris: List<Uri> = emptyList(),
    val uploadedAt: String,
    val uploadedBy: String
)
