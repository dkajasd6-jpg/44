
package com.gss.safe

import android.net.Uri
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.*
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.compose.*
import java.time.LocalDate

// --- Data Models ---
enum class UserRole { Worker, Admin }
data class User(val id: String, val name: String, val role: UserRole)

data class UploadedFile(
    val id: String,
    val name: String,
    val type: String,
    val uri: Uri,
    val uploadedBy: String,
    val uploadedAt: String
)

data class SafetyReport(
    val id: String,
    val type: String, // "위험발굴", "작업중지", "현장안전점검"
    val date: String,
    val issue: String? = null,
    val action: String? = null,
    val content: String? = null,
    val imageUris: List<Uri> = emptyList(),
    val uploadedBy: String,
    val uploadedAt: String
)

// --- Constants ---
val PrimaryTeal = Color(0xFF0097B2)
val BackgroundGray = Color(0xFFF8FAFC)

@Composable
fun GssSafeApp() {
    val navController = rememberNavController()
    var currentUser by remember { mutableStateOf<User?>(null) }

    NavHost(navController = navController, startDestination = "auth") {
        composable("auth") {
            AuthScreen(onLoginSuccess = { user ->
                currentUser = user
                navController.navigate("site_list")
            })
        }
        composable("site_list") {
            SiteListScreen(
                user = currentUser,
                onSiteClick = { siteId -> navController.navigate("dashboard/$siteId") },
                onLogout = { navController.popBackStack("auth", false) }
            )
        }
        composable("dashboard/{siteId}") { backStackEntry ->
            val siteId = backStackEntry.arguments?.getString("siteId")
            DashboardScreen(
                siteId = siteId,
                onCategoryClick = { catId -> navController.navigate("detail/$siteId/$catId") },
                onBack = { navController.popBackStack() }
            )
        }
        composable("detail/{siteId}/{catId}") { backStackEntry ->
            val siteId = backStackEntry.arguments?.getString("siteId")
            val catId = backStackEntry.arguments?.getString("catId")
            CategoryDetailScreen(
                siteId = siteId,
                catId = catId,
                onAddReport = { navController.navigate("report_form/$siteId/$catId") },
                onBack = { navController.popBackStack() }
            )
        }
        composable("report_form/{siteId}/{catId}") { backStackEntry ->
            val siteId = backStackEntry.arguments?.getString("siteId")
            val catId = backStackEntry.arguments?.getString("catId")
            ReportFormScreen(
                siteId = siteId,
                catId = catId,
                onComplete = { navController.popBackStack() },
                onCancel = { navController.popBackStack() }
            )
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AuthScreen(onLoginSuccess: (User) -> Unit) {
    var name by remember { mutableStateOf("") }
    var role by remember { mutableStateOf(UserRole.Worker) }

    Column(
        modifier = Modifier.fillMaxSize().background(BackgroundGray).padding(32.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Icon(Icons.Default.Shield, contentDescription = null, tint = PrimaryTeal, modifier = Modifier.size(64.dp))
        Text("GSS SAFE", fontSize = 28.sp, fontWeight = FontWeight.Black, color = PrimaryTeal)
        Spacer(modifier = Modifier.height(8.dp))
        Text("스마트 현장 안전관리 시스템", color = Color.Gray, fontSize = 14.sp)
        
        Spacer(modifier = Modifier.height(48.dp))

        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Button(
                onClick = { role = UserRole.Worker },
                modifier = Modifier.weight(1f),
                colors = ButtonDefaults.buttonColors(containerColor = if(role == UserRole.Worker) PrimaryTeal else Color.White),
                shape = RoundedCornerShape(16.dp),
                border = BorderStroke(1.dp, if(role == UserRole.Worker) PrimaryTeal else Color.LightGray)
            ) {
                Text("근로자용", color = if(role == UserRole.Worker) Color.White else Color.Gray)
            }
            Button(
                onClick = { role = UserRole.Admin },
                modifier = Modifier.weight(1f),
                colors = ButtonDefaults.buttonColors(containerColor = if(role == UserRole.Admin) PrimaryTeal else Color.White),
                shape = RoundedCornerShape(16.dp),
                border = BorderStroke(1.dp, if(role == UserRole.Admin) PrimaryTeal else Color.LightGray)
            ) {
                Text("관리자용", color = if(role == UserRole.Admin) Color.White else Color.Gray)
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        OutlinedTextField(
            value = name,
            onValueChange = { name = it },
            label = { Text("성함") },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp)
        )

        Spacer(modifier = Modifier.height(24.dp))

        Button(
            onClick = { onLoginSuccess(User("1", name.ifEmpty { "사용자" }, role)) },
            modifier = Modifier.fillMaxWidth().height(56.dp),
            colors = ButtonDefaults.buttonColors(containerColor = PrimaryTeal),
            shape = RoundedCornerShape(16.dp)
        ) {
            Text("로그인", fontWeight = FontWeight.Bold, fontSize = 16.sp)
        }
    }
}

@Composable
fun SiteListScreen(user: User?, onSiteClick: (String) -> Unit, onLogout: () -> Unit) {
    Scaffold(
        topBar = {
            Row(modifier = Modifier.fillMaxWidth().padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Default.Shield, contentDescription = null, tint = PrimaryTeal)
                Text("GSS SAFE", modifier = Modifier.padding(start = 8.dp), fontWeight = FontWeight.Bold, color = PrimaryTeal)
                Spacer(modifier = Modifier.weight(1f))
                IconButton(onClick = onLogout) { Icon(Icons.Default.Logout, contentDescription = null, tint = Color.Gray) }
            }
        }
    ) { padding ->
        Column(modifier = Modifier.padding(padding).padding(16.dp)) {
            Text("현장 목록", fontSize = 24.sp, fontWeight = FontWeight.Bold)
            Text("${user?.name}님, 환영합니다.", color = Color.Gray)
            
            Spacer(modifier = Modifier.height(24.dp))

            LazyColumn(verticalArrangement = Arrangement.spacedBy(16.dp)) {
                items(listOf("서울 테헤란로 현장", "부산 해운대 현장")) { siteName ->
                    Card(
                        onClick = { onSiteClick(siteName) },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(24.dp),
                        colors = CardDefaults.cardColors(containerColor = Color.White),
                        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                    ) {
                        Column(modifier = Modifier.padding(24.dp)) {
                            Icon(Icons.Default.Business, contentDescription = null, tint = PrimaryTeal, modifier = Modifier.size(32.dp))
                            Spacer(modifier = Modifier.height(12.dp))
                            Text(siteName, fontSize = 18.sp, fontWeight = FontWeight.Bold)
                            Spacer(modifier = Modifier.height(4.dp))
                            Row {
                                Text("현장소장: 김철수", fontSize = 12.sp, color = Color.Gray)
                                Spacer(modifier = Modifier.width(12.dp))
                                Text("관리감독자: 이영희", fontSize = 12.sp, color = Color.Gray)
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun ReportFormScreen(siteId: String?, catId: String?, onComplete: () -> Unit, onCancel: () -> Unit) {
    var content by remember { mutableStateOf("") }
    var selectedDate by remember { mutableStateOf(LocalDate.now().toString()) }
    var selectedUris by remember { mutableStateOf<List<Uri>>(emptyList()) }

    val photoLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetMultipleContents()
    ) { uris ->
        selectedUris = (selectedUris + uris).take(6)
    }

    Scaffold(
        topBar = {
            CenterAlignedTopAppBar(
                title = { Text("현장 안전 점검 등록", fontSize = 18.sp, fontWeight = FontWeight.Bold) },
                navigationIcon = { IconButton(onClick = onCancel) { Icon(Icons.Default.Close, null) } }
            )
        }
    ) { padding ->
        Column(modifier = Modifier.padding(padding).padding(24.dp).verticalScroll(rememberScrollState())) {
            Text("점검 날짜", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = Color.Gray)
            OutlinedTextField(
                value = selectedDate,
                onValueChange = { selectedDate = it },
                modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp),
                shape = RoundedCornerShape(12.dp),
                leadingIcon = { Icon(Icons.Default.CalendarToday, null) }
            )

            Spacer(modifier = Modifier.height(16.dp))

            Text("점검 내용", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = Color.Gray)
            OutlinedTextField(
                value = content,
                onValueChange = { content = it },
                modifier = Modifier.fillMaxWidth().height(150.dp).padding(vertical = 8.dp),
                shape = RoundedCornerShape(12.dp),
                placeholder = { Text("상세 내용을 입력하세요") }
            )

            Spacer(modifier = Modifier.height(16.dp))

            Row(verticalAlignment = Alignment.CenterVertically) {
                Text("첨부 사진 (${selectedUris.size}/6)", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = Color.Gray)
                Spacer(modifier = Modifier.weight(1f))
            }
            
            Spacer(modifier = Modifier.height(8.dp))

            LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                items(selectedUris) { uri ->
                    Box(modifier = Modifier.size(100.dp).clip(RoundedCornerShape(12.dp))) {
                        // 실제 앱에서는 Coil 라이브러리 등을 사용하여 이미지 로드 (AsyncImage)
                        Box(modifier = Modifier.fillMaxSize().background(Color.LightGray))
                        IconButton(
                            onClick = { selectedUris = selectedUris.filter { it != uri } },
                            modifier = Modifier.align(Alignment.TopEnd).size(24.dp).background(Color.Black.copy(alpha = 0.5f))
                        ) {
                            Icon(Icons.Default.Close, null, tint = Color.White, modifier = Modifier.size(14.dp))
                        }
                    }
                }
                if (selectedUris.size < 6) {
                    item {
                        Box(
                            modifier = Modifier.size(100.dp).border(2.dp, Color.LightGray, RoundedCornerShape(12.dp))
                                .clickable { photoLauncher.launch("image/*") },
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(Icons.Default.CameraAlt, null, tint = Color.LightGray)
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(32.dp))

            Button(
                onClick = onComplete,
                modifier = Modifier.fillMaxWidth().height(56.dp),
                colors = ButtonDefaults.buttonColors(containerColor = PrimaryTeal),
                shape = RoundedCornerShape(16.dp),
                enabled = content.isNotBlank()
            ) {
                Text("등록 완료", fontWeight = FontWeight.Bold)
            }
        }
    }
}

@Composable
fun DashboardScreen(siteId: String?, onCategoryClick: (String) -> Unit, onBack: () -> Unit) {
    // 카테고리 리스트
    val categories = listOf("GSA", "GSB", "GSC", "GSD", "GSE", "GSF", "GSG", "현장 안전 점검", "위험발굴/작업중지")

    Scaffold(
        topBar = {
            CenterAlignedTopAppBar(
                title = { Text(siteId ?: "현장 명칭", fontWeight = FontWeight.Bold, fontSize = 16.sp) },
                navigationIcon = { IconButton(onClick = onBack) { Icon(Icons.Default.ArrowBack, null) } }
            )
        }
    ) { padding ->
        LazyColumn(modifier = Modifier.padding(padding).padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            items(categories) { catName ->
                Card(
                    onClick = { onCategoryClick(catName) },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    border = BorderStroke(1.dp, Color(0xFFEEEEEE))
                ) {
                    Row(modifier = Modifier.padding(20.dp), verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Description, null, tint = Color.LightGray)
                        Text(catName, modifier = Modifier.padding(start = 16.dp).weight(1f), fontWeight = FontWeight.Bold)
                        Icon(Icons.Default.ChevronRight, null, tint = Color.LightGray)
                    }
                }
            }
        }
    }
}

@Composable
fun CategoryDetailScreen(siteId: String?, catId: String?, onAddReport: () -> Unit, onBack: () -> Unit) {
    val isSafetyCategory = catId == "현장 안전 점검" || catId == "위험발굴/작업중지"
    
    // 파일 선택 런처 (모든 문서 지원)
    val fileLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.OpenMultipleDocuments()
    ) { uris ->
        // 파일 업로드 처리 로직
    }

    Scaffold(
        topBar = {
            CenterAlignedTopAppBar(
                title = { 
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(catId ?: "", fontWeight = FontWeight.Bold, fontSize = 16.sp)
                        Text(siteId ?: "", fontSize = 10.sp, color = PrimaryTeal)
                    }
                },
                navigationIcon = { IconButton(onClick = onBack) { Icon(Icons.Default.ArrowBack, null) } },
                actions = {
                    if (isSafetyCategory) {
                        IconButton(onClick = onAddReport) { Icon(Icons.Default.Add, null, tint = PrimaryTeal) }
                    } else {
                        IconButton(onClick = { 
                            fileLauncher.launch(arrayOf(
                                "application/pdf", 
                                "application/vnd.ms-powerpoint", 
                                "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                                "image/*"
                            ))
                        }) { Icon(Icons.Default.FileUpload, null, tint = PrimaryTeal) }
                    }
                }
            )
        }
    ) { padding ->
        Box(modifier = Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Icon(Icons.Default.Assignment, null, modifier = Modifier.size(64.dp), tint = Color.LightGray)
                Spacer(modifier = Modifier.height(16.dp))
                Text("등록된 내역이 없습니다.", color = Color.Gray, fontWeight = FontWeight.Bold)
                Text("상단의 버튼을 눌러 추가해주세요.", fontSize = 12.sp, color = Color.LightGray)
            }
        }
    }
}
